import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const response = await fetch('https://seller-qa2-gcp.gdn-app.com/backend/product-external/api/images/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'SESSION=b5b916c4-7316-4053-9321-fa6ee14e3cab'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}