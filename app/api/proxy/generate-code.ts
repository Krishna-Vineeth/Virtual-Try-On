import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const response = await fetch('http://pcu-external-api.qa2-sg.cld/pcu-external-api/api/generators/generateProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'SESSION=b5b916c4-7316-4053-9321-fa6ee14e3cab'
            }
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}