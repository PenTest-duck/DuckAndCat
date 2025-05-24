export const getRoleplayDescription = async (roleplayName: string, languageName: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roleplay/description`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roleplay_name: roleplayName,
                language: languageName,
            }),
        }
    );
    return response.json();
};

export const getRoleplayImage = async (
    teacherId: string,
    roleplayName: string,
    roleplayScenario: string,
    languageName: string,
) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roleplay/image`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                teacher_id: teacherId,
                roleplay_name: roleplayName,
                roleplay_scenario: roleplayScenario,
                language: languageName,
            }),
        }
    );
    return response.json();
};
export const deleteRoleplayPreviews = async (teacherId: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roleplay/deletePreviews?teacher_id=${teacherId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response.json();
};