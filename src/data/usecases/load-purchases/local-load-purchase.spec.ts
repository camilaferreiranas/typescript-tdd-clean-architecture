import {LocalManagePurchases} from "@/data/usecases";
import {CacheStoreSpy} from "@/data/tests";

type SutTypes = {
    sut: LocalManagePurchases
    cacheStorage: CacheStoreSpy
}
const makeSut = (timestamp = new Date()): SutTypes => {
    const cacheStorage = new CacheStoreSpy();
    const sut = new LocalManagePurchases(cacheStorage, timestamp)
    return {
        sut, cacheStorage
    }
}


describe('LocalLoadPurchase', () => {
    test('Should not delete cache on init', () => {
        const {cacheStorage} = makeSut()
        expect(cacheStorage.actions).toEqual([]);
    })


    test('Should call correct key on load ', async () => {
        const {cacheStorage, sut} = makeSut()
        await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
    })

    test('Should return empty list if load fails ', async () => {
        const {cacheStorage, sut} = makeSut()
        cacheStorage.simulateFetchError();
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
        expect(cacheStorage.deleteKey).toBe('purchases');
        expect(purchases).toEqual([])
    })

})