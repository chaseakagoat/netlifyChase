const validKeys = new Map([
    ["pass", "user"],
]);

const userDevices = new Map();

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { key, deviceId } = JSON.parse(event.body);
        
        if (!validKeys.has(key)) {
            for (let [username, devices] of userDevices) {
                if (devices.has(deviceId)) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            verified: true,
                            username: username
                        })
                    };
                }
            }
            
            return {
                statusCode: 401,
                body: JSON.stringify({ 
                    verified: false,
                    message: "Invalid or already used key"
                })
            };
        }
        
        const username = validKeys.get(key);
        
        if (!userDevices.has(username)) {
            userDevices.set(username, new Set());
        }
        userDevices.get(username).add(deviceId);
        
        validKeys.delete(key);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                verified: true,
                username: username
            })
        };
    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error' })
        };
    }
};
