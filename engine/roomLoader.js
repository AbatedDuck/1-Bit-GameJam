export async function loadRoom(roomName) {
    try {
        const response = await fetch(`./assets/roomJson/${roomName}.json`);        
        if (!response.ok) {
            throw new Error(`Could not load room: ${roomName}`);
        }
        const roomData = await response.json();
        return roomData;
    } catch (error) {
        console.error("Error loading room data:", error);
    }
}