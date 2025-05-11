const validKeys = new Map([
    ["butthole", "UserName1"],
    ["loltest", "UserName1"],
    ["yaksho", "Yakshop"],
    ["appstwi", "Appshop"],
    ["kicksman", "Kickshop"],
    ["senseiyol", "Sensei Yolo"],
    ["jaykw", "test"],
    ["jaykwichas", "test"],
    ["jaykw", "jaykwi@chase.com"],
    ["Chase", "chase@chase.com"],
    ["test83", "test83"], 

]);

// Add a map to track device IDs for each username
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
        
        // Check if the key exists
        if (!validKeys.has(key)) {
            // Check if this device was previously authorized for any user
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
        
        // Store the device ID for this user
        if (!userDevices.has(username)) {
            userDevices.set(username, new Set());
        }
        userDevices.get(username).add(deviceId);
        
        // Remove the key after first use
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
