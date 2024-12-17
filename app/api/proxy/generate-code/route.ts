import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = await fetch('http://pcu-external-api.qa2-sg.cld/pcu-external-api/api/generators/generateProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'SESSION=b5b916c4-7316-4053-9321-fa6ee14e3cab'
            }
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