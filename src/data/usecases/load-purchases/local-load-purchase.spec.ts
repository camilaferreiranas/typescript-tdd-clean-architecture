import {LocalManagePurchases} from "@/data/usecases";
import {CacheStoreSpy, mockPurchases} from "@/data/tests";

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


    test('Should return empty list if load fails ', async () => {
        const {cacheStorage, sut} = makeSut()
        cacheStorage.simulateFetchError();
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
        expect(cacheStorage.deleteKey).toBe('purchases');
        expect(purchases).toEqual([])
    })

    test('Should return a list of purchases if cache less than 3 days old ', async () => {
        const timestamp = new Date();
        const {cacheStorage, sut} = makeSut(timestamp)
        cacheStorage.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(purchases).toEqual(cacheStorage.fetchResult.value)
    })
})