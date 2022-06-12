import {LocalSavePurchases} from "@/data/usecases";
import {CacheStoreSpy, mockPurchases} from "@/data/tests";

type SutTypes = {
    sut: LocalSavePurchases
    cacheStorage: CacheStoreSpy
}
const makeSut = (timestamp = new Date()): SutTypes => {
    const cacheStorage = new CacheStoreSpy();
    const sut = new LocalSavePurchases(cacheStorage, timestamp)
    return {
        sut, cacheStorage
    }
}


describe('LocalSavePurchases', () => {
    test('Should not delete cache on init', () => {
        const {cacheStorage} = makeSut()
        expect(cacheStorage.actions).toEqual([]);
    })
    test('Shouldnt insert new cache if delete fails ', () => {
        const {cacheStorage, sut} = makeSut()
        const purchases = mockPurchases()
        cacheStorage.simulateDeleteError();
        const promise = sut.save(purchases);
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.delete]);
        expect(promise).rejects.toThrow();
    })
    test('Should insert new cache if delete succeds ', async () => {
        const timestamp = new Date()
        const {cacheStorage, sut} = makeSut(timestamp)
        const purchases = mockPurchases()
        const promise =  sut.save(purchases);
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert]);
        expect(cacheStorage.insertKey).toBe('purchases');
        expect(cacheStorage.deleteKey).toBe('purchases');
        expect(cacheStorage.insertValues).toEqual({
            timestamp,
            value: purchases
        });
        await expect(promise).resolves.toBeFalsy()
    })

    test('Should throw if insert throws ', async () => {
        const {cacheStorage, sut} = makeSut()
        cacheStorage.simulateInsertError();
        const promise = sut.save(mockPurchases())
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert]);
        await expect(promise).rejects.toThrow();
    })


})