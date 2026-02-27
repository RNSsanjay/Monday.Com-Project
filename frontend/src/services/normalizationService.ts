export const normalizationService = {
    normalizeRevenue(value: string | null | undefined): number {
        if (!value) return 0;

        // Remove currency symbols and commas
        let clean = value.replace(/[₹$,]/g, '').trim().toLowerCase();

        let multiplier = 1;
        if (clean.endsWith('k')) {
            multiplier = 1000;
            clean = clean.slice(0, -1);
        } else if (clean.endsWith('m')) {
            multiplier = 1000000;
            clean = clean.slice(0, -1);
        } else if (clean.endsWith('l')) {
            multiplier = 100000;
            clean = clean.slice(0, -1);
        }

        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num * multiplier;
    },

    normalizeProbability(value: string | null | undefined): number {
        if (!value) return 0;
        let clean = value.replace('%', '').trim();
        const num = parseFloat(clean);
        if (isNaN(num)) return 0;
        return num > 1 ? num / 100 : num;
    },

    normalizeBoardData(items: any[]) {
        return items.map(item => {
            const normalized: any = { id: item.id, name: item.name };
            item.column_values.forEach((cv: any) => {
                const id = cv.id.toLowerCase();
                const text = cv.text;

                if (id.includes('revenue') || id.includes('amount') || id.includes('value')) {
                    normalized.revenue = this.normalizeRevenue(text);
                } else if (id.includes('prob')) {
                    normalized.probability = this.normalizeProbability(text);
                } else if (id.includes('stage') || id.includes('status')) {
                    normalized.stage = text || 'Unknown';
                    normalized.status = text || 'Unknown';
                } else if (id.includes('sector') || id.includes('industry')) {
                    normalized.sector = text || 'Other';
                }
            });

            // Default values if missing
            normalized.revenue = normalized.revenue || 0;
            normalized.probability = normalized.probability || 0;
            normalized.stage = normalized.stage || 'Unknown';
            normalized.sector = normalized.sector || 'Other';

            return normalized;
        });
    }
};
