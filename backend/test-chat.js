const jwt = require('jsonwebtoken');

async function test() {
  try {
    const token = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET || 'campuscompanion_secret_2025', { expiresIn: '1h' });

    console.log('Calling /api/chat with token...', token);
    const chatRes = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ messages: [{role: 'user', content: 'hello'}] })
    });
    
    const chatBodyRaw = await chatRes.text();
    console.log('Status:', chatRes.status);
    console.log('Response RAW:', chatBodyRaw);

  } catch (err) {
    console.log('Fetch Error:', err.message);
  }
}

test();


