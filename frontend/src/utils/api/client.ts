export const getRoleplayDescription = async (roleplayName: string, language: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roleplay/description`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roleplay_name: roleplayName,
                language: language,
            }),
        }
    );
    return response.json();
};
