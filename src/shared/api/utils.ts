export const objectToFormData = (obj: object) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(obj)) {
        formData.append(key, value)
    }

    return formData
}

export const fetchWithJson = async <T>(url: string, tag: string) => {
    const data = await fetch(url, { cache: 'no-cache', next: { tags: [tag] } })

    return await data.json() as T
}
