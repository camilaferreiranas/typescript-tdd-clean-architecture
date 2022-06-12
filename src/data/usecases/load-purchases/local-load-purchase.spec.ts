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
        const currentDate = new Date();
        const timestamp = new Date(currentDate);
        timestamp.setDate(timestamp.getDate() - 3);
        timestamp.setSeconds(timestamp.getSeconds() + 1);
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(purchases).toEqual(cacheStorage.fetchResult.value)
    })
    test('Should return a empty list of purchases if cache more than 3 days old ', async () => {
        const currentDate = new Date();
        const timestamp = new Date(currentDate);
        timestamp.setDate(timestamp.getDate() - 3);
        timestamp.setSeconds(timestamp.getSeconds() - 1);
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(cacheStorage.deleteKey).toBe('purchases');
        expect(purchases).toEqual([])
    })
    test('Should return a empty list of purchases if cache is 3 days old ', async () => {
        const currentDate = new Date();
        const timestamp = new Date(currentDate);
        timestamp.setDate(timestamp.getDate() - 3);
        timestamp.setSeconds(timestamp.getSeconds());
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(cacheStorage.deleteKey).toBe('purchases');
        expect(purchases).toEqual([])
    })

    test('Should return an empty list if cache is empty ', async () => {
        const currentDate = new Date();
        const timestamp = new Date(currentDate);
        timestamp.setDate(timestamp.getDate() - 3);
        timestamp.setSeconds(timestamp.getSeconds() + 1);
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,
            value: []
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(purchases).toEqual([])
    })
})