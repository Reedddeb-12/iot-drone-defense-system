// Test email sending
const fetch = require('node-fetch');

async function testEmail() {
    try {
        console.log('Testing email alert...');
        
        const response = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: 'reeddhijitdeb@gmail.com',
                subject: '🚨 TEST ALERT - Drone Defense System',
                body: 'This is a test email from your Drone Defense System.',
                threatLevel: 'HIGH',
                html: `
                    <div style="font-family: Arial; padding: 20px; background: #1a472a; color: white;">
                        <h1 style="color: #00ff88;">🚨 TEST ALERT</h1>
                        <p>This is a test email from your Drone Defense System.</p>
                        <p>If you received this, email alerts are working correctly!</p>
                    </div>
                `
            })
        });

        const result = await response.json();
        console.log('Response:', result);
        
        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log('Check your inbox: reeddhijitdeb@gmail.com');
        } else {
            console.log('❌ Email failed:', result.error);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEmail();
