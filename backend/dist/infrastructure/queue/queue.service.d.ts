import { ClientProxy } from '@nestjs/microservices';
export declare class QueueService {
    private client;
    constructor(client: ClientProxy);
    publishMessage(message: any): Promise<import("rxjs").Observable<any>>;
}
