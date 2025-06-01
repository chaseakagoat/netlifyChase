// Define valid keys and their associated usernames
const validKeys = new Map([
 
  
    ["helloworld", "12384"],
    ["mytestkey", "TesterUser"],
    ["keyonlyonce", "LimitedUser"]
]);

// Track authorized device IDs per username
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

        // If the key is NOT in validKeys...
        if (!validKeys.has(key)) {
            // ...check if this device is already authorized
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

            // If no match found, reject
            return {
                statusCode: 401,
                body: JSON.stringify({
                    verified: false,
                    message: "Invalid or already used key"
                })
            };
        }

        // Key is valid → get the associated username
        const username = validKeys.get(key);

        // Save device ID for future access
        if (!userDevices.has(username)) {
            userDevices.set(username, new Set());
        }
        userDevices.get(username).add(deviceId);

        // Invalidate the key so it can't be reused
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
