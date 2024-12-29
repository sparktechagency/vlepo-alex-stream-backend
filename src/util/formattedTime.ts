

export const formattedTime = (date: any) => {
    const formattedTime = new Date(date).toLocaleString("en-US", {
        weekday: "long", // e.g., Monday
        year: "numeric", // e.g., 2024
        month: "long", // e.g., December
        day: "numeric", // e.g., 25
        hour: "2-digit", // e.g., 10 PM
        minute: "2-digit", // e.g., 10:30 PM
    });
    return formattedTime;
}