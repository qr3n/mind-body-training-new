import { IDBPDatabase, openDB } from "idb";

export class IndexedDBService {
    db: IDBPDatabase;

    constructor(db: IDBPDatabase) {
        this.db = db;
    }

    static async initialize() {
        const db = await openDB("trainingMediaDB", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("videos")) {
                    db.createObjectStore("videos", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("sounds")) {
                    db.createObjectStore("sounds", { keyPath: "id" });
                }
            },
        });

        return new IndexedDBService(db);
    }

    private async save(storeName: string, data: { id: string; blob: Blob }) {
        const tx = this.db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        await store.delete(data.id)
        await store.put(data);
        await tx.done;
    }

    async save_video(data: { id: string; checksum?: string, blob: Blob }) {
        return this.save("videos", data);
    }

    async save_audio(data: { id: string; blob: Blob }) {
        return this.save("sounds", data);
    }

    private async get(storeName: string, id: string): Promise<{ id: string; blob: Blob } | undefined> {
        const tx = this.db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const result = await store.get(id);
        await tx.done;
        return result;
    }

    async get_video(id: string): Promise<{ id: string; blob: Blob } | undefined> {
        return this.get("videos", id);
    }

    async get_audio(id: string): Promise<{ id: string; blob: Blob } | undefined> {
        return this.get("sounds", id);
    }
}

