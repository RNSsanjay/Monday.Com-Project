const MONDAY_API_TOKEN = import.meta.env.VITE_MONDAY_API_TOKEN;

export const mondayService = {
    async fetchItems(boardId: string) {
        const query = `
      query {
        boards (ids: [${boardId}]) {
          items_page (limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;

        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_API_TOKEN,
                'API-Version': '2023-10'
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        return result.data.boards[0].items_page.items;
    },

    async getBoardIdByName(name: string) {
        const query = `
      query {
        boards (limit: 100) {
          id
          name
        }
      }
    `;

        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_API_TOKEN,
                'API-Version': '2023-10'
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        const board = result.data.boards.find((b: { name: string }) =>
            b.name.toLowerCase().includes(name.toLowerCase())
        );
        return board ? board.id : null;
    }
};
