import { Groq } from 'groq-sdk';
import { mondayService } from './mondayService';
import { normalizationService } from './normalizationService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'llama-3.3-70b-versatile';

const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Enable for personal/local use as requested
});

export class AgentService {
    private trace: string[] = [];

    private addTrace(step: string) {
        this.trace.push(step);
    }

    private async fetchAndAnalyzeDeals() {
        this.addTrace("Detecting 'Deals' board ID...");
        const boardId = await mondayService.getBoardIdByName("Deals");
        if (!boardId) {
            this.addTrace("Error: Deals board not found.");
            return { error: "Deals board not found" };
        }

        this.addTrace(`Fetching live items from Deals board (ID: ${boardId})...`);
        const items = await mondayService.fetchItems(boardId);

        this.addTrace(`Normalizing ${items.length} records...`);
        const normalized = normalizationService.normalizeBoardData(items);

        this.addTrace("Performing BI analytics on deals...");
        const totalDeals = normalized.length;
        const closedRevenue = normalized
            .filter(d => d.stage.toLowerCase() === 'closed')
            .reduce((sum, d) => sum + d.revenue, 0);
        const weightedPipeline = normalized
            .reduce((sum, d) => sum + (d.revenue * d.probability), 0);

        const revenueBySector: Record<string, number> = {};
        normalized.forEach(d => {
            revenueBySector[d.sector] = (revenueBySector[d.sector] || 0) + d.revenue;
        });

        return {
            totalDeals,
            closedRevenue,
            weightedPipeline,
            revenueBySector,
            dataQuality: {
                missingRevenue: normalized.filter(d => !d.revenue).length,
                missingProbability: normalized.filter(d => !d.probability).length
            },
            itemList: normalized // Added for tabular view
        };
    }

    private async fetchAndAnalyzeWorkOrders() {
        this.addTrace("Detecting 'Work Orders' board ID...");
        const boardId = await mondayService.getBoardIdByName("Work Orders");
        if (!boardId) {
            this.addTrace("Error: Work Orders board not found.");
            return { error: "Work Orders board not found" };
        }

        this.addTrace(`Fetching live items from Work Orders board (ID: ${boardId})...`);
        const items = await mondayService.fetchItems(boardId);

        this.addTrace(`Normalizing ${items.length} records...`);
        const normalized = normalizationService.normalizeBoardData(items);

        return {
            totalOrders: normalized.length,
            statusDistribution: normalized.reduce((acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            itemList: normalized // Added for tabular view
        };
    }

    async chat(userQuery: string) {
        this.trace = [];
        this.addTrace(`Intent detected: ${userQuery}`);

        const tools = [
            {
                type: "function",
                function: {
                    name: "fetchAndAnalyzeDeals",
                    description: "Fetch and analyze all data from the Deals board for revenue, pipeline, and sectors.",
                }
            },
            {
                type: "function",
                function: {
                    name: "fetchAndAnalyzeWorkOrders",
                    description: "Fetch and analyze data from the Work Orders board for status and progress.",
                }
            }
        ];

        const messages: any[] = [
            {
                role: "system",
                content: "You are AstraBI, an elite Autonomous Business Intelligence Protocol. Your persona is strictly professional, executive-level, and precise. " +
                    "CRITICAL: Do NOT use emojis. Maintain a formal, high-integrity tone at all times. " +
                    "For analytical queries requiring data tools, you MUST format your response into five sections: " +
                    "1. **Data Summary**\n2. **Business Insight**\n3. **Strategic Recommendation**\n4. **Data Caveats**\n5. **Recommended Questions**\n" +
                    "For non-analytical queries or greetings (e.g., 'Hi', 'Who are you?'), respond professionally and direct the user toward data-driven analysis without forcing the 5-section structure. " +
                    "Always offer assistance in a formal, respectful manner. " +
                    "In section 5 of analytical reports, provide 3 brief, high-value follow-up questions. " +
                    "Use Markdown Tables for any data lists or tabular requests."
            },
            { role: "user", content: userQuery }
        ];

        const response = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: messages,
            tools: tools as any,
            tool_choice: "auto" as any
        });

        const responseMessage = response.choices[0].message;
        const toolCalls = responseMessage.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
            messages.push(responseMessage);

            for (const toolCall of toolCalls) {
                if (!toolCall.function) continue;

                const functionName = toolCall.function.name;
                let functionResponse;

                if (functionName === "fetchAndAnalyzeDeals") {
                    functionResponse = await this.fetchAndAnalyzeDeals();
                } else if (functionName === "fetchAndAnalyzeWorkOrders") {
                    functionResponse = await this.fetchAndAnalyzeWorkOrders();
                }

                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(functionResponse)
                });
            }

            const secondResponse = await groq.chat.completions.create({
                model: MODEL_NAME,
                messages: messages
            });

            return {
                response: secondResponse.choices[0].message.content,
                trace: this.trace
            };
        }

        return {
            response: responseMessage.content,
            trace: this.trace
        };
    }
}
