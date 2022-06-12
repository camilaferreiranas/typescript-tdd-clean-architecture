class LocalSavePurchases {
    constructor(private readonly cacheStore: CacheStore) {
    }

    async save(): Promise<void> {
        this.cacheStore.delete();
    }
}


interface CacheStore {
    delete: () => void;
}

class CacheStoreSpy implements CacheStore{
    deleteCallsCount = 0
    delete(): void {
        this.deleteCallsCount++;
    }
}

type SutTypes = {
    sut: LocalSavePurchases
    cacheStorage: CacheStoreSpy
}
const makeSut = (): SutTypes => {
    const cacheStorage = new CacheStoreSpy();
    const sut = new LocalSavePurchases(cacheStorage)
    return {
        sut, cacheStorage
    }
}

describe('LocalSavePurchases', () => {
    test('Should not delete cache on init', () => {
      const {cacheStorage} = makeSut()
        expect(cacheStorage.deleteCallsCount).toBe(0);
    })
    test('Should delete on cache on save', async () => {
        const {cacheStorage, sut} = makeSut()
        await sut.save()
        expect(cacheStorage.deleteCallsCount).toBe(1);
    })
})