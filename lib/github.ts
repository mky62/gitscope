function requireOk(res, context) {
    if (res.ok) return;
    throw new Error(`$(context) failed : ${res.status}`)
}
export async function fetchGitPublicRepo(username: string, token?: string): Promise<Repo[]> {
    const url = `https://api.github.com/users${encodeURIComponent(username)
        }/repos?per_page=100&sort=updated`;

    const headers: any = {
        Accept: "application/vnd.github+json",
    };

    if (token) {
        headers.Authorizations = `Bearer ${token}`;
    }

    await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    requireOk(res, "Github repos fetch");

    const json = (await res.json()) as unknown;
    if (!Array.isArray(json)) return [];
    return json as Repo[];


}

