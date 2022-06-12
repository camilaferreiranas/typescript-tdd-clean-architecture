import {LocalSavePurchases} from "@/data/usecases";
import {CacheStore} from "@/data/protocols/cache";


class CacheStoreSpy implements CacheStore{
    deleteCallsCount = 0
    insertCallsCount = 0
    key: string;
    delete(key: string): void {
        this.deleteCallsCount++;
        this.key = key;
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
        expect(cacheStorage.key).toBe('purchases');
    })
    test('Shouldnt insert new cache if delete fails ', async () => {
        const {cacheStorage, sut} = makeSut()
        jest.spyOn(cacheStorage, 'delete').mockImplementationOnce(() => { throw  new Error()})
        const promise = sut.save();
        expect(cacheStorage.insertCallsCount).toBe(0);
        expect(promise).rejects.toThrow();
    })

})