declare module './robotutils' {
    interface RobotUtilsInterface {
        onServices: (servicesCallback: Function, errorCallback?: Function, host?: string) => void;
        subscribeToALMemoryEvent: (event: string, eventCallback: Function, subscribeDoneCallback?: Function) => MemoryEventSubscription;
        connect: (connectedCallback: Function, failureCallback?: Function) => void;
        robotIp: string | null;
        session: any;
    }

    export const RobotUtilsNao: RobotUtilsInterface;
}