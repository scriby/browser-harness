// Type definitions for Browser Harness
// Project: https://github.com/scriby/browser-harness
// Definitions by: Chris Scribner <https://github.com/scriby>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />

declare module "browser-harness" {
    import events = require("events");

    interface HarnessEvents extends events.NodeEventEmitter {
        once(event: string, listener: (driver: Driver) => void): void;
        once(event: 'ready', listener: (driver: Driver) => void): void;

        on(event: string, listener: (driver: Driver) => void): void;
        on(event: 'ready', listener: (driver: Driver) => void): void;
    }

    interface DriverEvents extends events.NodeEventEmitter {
        once(event: string, listener: (text: string) => void): void;
        once(event: 'console.log', listener: (text: string, location?: string) => void): void;
        once(event: 'console.warn', listener: (text: string, location?: string) => void): void;
        once(event: 'console.error', listener: (text: string, location?: string) => void): void;
        once(event: 'window.onerror', listener: (text: string) => void): void;

        on(event: string, listener: (text: string) => void): void;
        on(event: 'console.log', listener: (text: string, location?: string) => void): void;
        on(event: 'console.warn', listener: (text: string, location?: string) => void): void;
        on(event: 'console.error', listener: (text: string, location?: string) => void): void;
        on(event: 'window.onerror', listener: (text: string) => void): void;
    }

    export interface Driver {
        exec(args: { func: Function; args?: any}, callback?: Function) : any;
        exec(func: Function, callback?: Function) : any;

        setUrl(url: string, callback?: Function): void;
        reuseBrowser(harnessUrl?: string): void;

        waitFor(args: { condition: Function; exec?: Function; timeoutMS?: number; args?: any; timeoutError?: string; inBrowser?: boolean }, callback?: Function): void;
        waitFor(condition: Function, callback?: Function): void;

        findElement(selector: string, callback?: (err: Error, element: ElementProxy) => void): ElementProxy;
        findElements(selector: string, callback?: (err: Error, elements: ElementProxy) => void): ElementProxy;

        findVisible(selector: string, callback?: (err: Error, element: ElementProxy) => void): ElementProxy;
        findVisibles(selector: string, callback?: (err: Error, elements: ElementProxy) => void): ElementProxy;
        find(selector: string, callback?: (err: Error, elements: ElementProxy) => void): ElementProxy;

        $(content: any, callback?: (err: Error, elements: ElementProxy) => void): ElementProxy;
        $(content: any, context: ElementProxy, callback?: (err: Error, elements: ElementProxy) => void): ElementProxy;

        clearLastPopupWindow(callback?: (err: Error) => void): void;
        getLastPopupWindow(callback?: (err: Error, windowProxy: WindowProxy) => void): WindowProxy;

        events: DriverEvents;
        focusedWindow: WindowProxy;
    }

    export interface TopLeft {
        top: number;
        left: number;
    }

    export interface ElementProxy {
        length: number;

        click(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        dblclick(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        focus(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        blur(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        val(callback?: (err: Error, value: string) => void) : string
        val(value?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        attr(name: string, callback?: (err: Error, value: string) => void) : string
        attr(name: string, value: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        removeAttr(name: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        prop(name: string, callback?: (err: Error, value: string) => void) : any
        prop(name: string, value?: boolean, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        prop(name: string, value?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        removeProp(name: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        html(callback?: (err: Error, value: string) => void) : string
        html(value?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        text(callback?: (err: Error, value: string) => void) : string
        text(value?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        hasClass(className: string, callback?: (err: Error, value: boolean) => void) : boolean
        addClass(className: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        removeClass(className: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        toggleClass(className: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        trigger(event: string, extraParameters?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        triggerHandler(event: string, extraParameters?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        css(name: string, callback?: (err: Error, value: string) => void) : string
        css(name: string, value?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        height(callback?: (err: Error, value: number) => void) : number
        height(value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        innerHeight(callback?: (err: Error, value: number) => void) : number
        innerHeight(value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        outerHeight(callback?: (err: Error, value: number) => void) : number
        outerHeight(value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        width(callback?: (err: Error, value: number) => void) : number
        width(value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        innerWidth(callback?: (err: Error, value: number) => void) : number
        innerWidth(value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        outerWidth(callback?: (err: Error, value: number) => void) : number
        outerWidth(value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        offset(callback?: (err: Error, value: TopLeft) => void) : TopLeft
        offset(value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        position(callback?: (err: Error, value: TopLeft) => void) : TopLeft
        scrollLeft(callback?: (err: Error, value: number) => void) : number
        scrollLeft(value?: number, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        scrollTop(callback?: (err: Error, value: number) => void) : number
        scrollTop(value?: number, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        hide(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        show(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        toggle(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        children(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        closest(selector: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        contents(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        find(selector: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        findElements(selector: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        findElement(selector: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        findVisible(selector: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        findVisibles(selector: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        first(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        has(arg: any, callback?: (err: Error, element: ElementProxy) => void) : boolean
        is(arg: any, callback?: (err: Error, element: ElementProxy) => void) : boolean
        last(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        next(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        nextAll(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        nextUntil(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        offsetParent(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        parent(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        parents(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        parentsUntil(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        prev(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        prevAll(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        prevUntil(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        siblings(selector?: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        eq(index: number, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        data(name: string, callback?: (err: Error, value: any) => void) : any
        data(name: string, value?: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        removeData(name: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        filter(selector: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        append(content: any, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        selectDropdownByText(text: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        selectDropdownByValue(value: string, callback?: (err: Error, eleemnt: ElementProxy) => void) : ElementProxy
        selectDropdownByIndex(index: number, callback?: (err: Error, element: ElementProxy) => void): ElementProxy
        setText(text: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        change(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
        sendEnterKey(callback?: (err: Error, element: ElementProxy) => void) : ElementProxy

        waitUntil(selector: string, callback?: (err: Error, element: ElementProxy) => void) : ElementProxy
    }

    export interface WindowProxy {
        getDriver(): Driver;
        isOpen(callback?: (err: Error, isOpen: boolean) => void): boolean;
    }

    export class Browser {
        //constructor(args: { type: string; location?: string; args?: string[] });
        constructor(args: { type: string; location?: string; args?: any; });

        open(harnessUrl: string, serverUrl?: string): void;
        close(callback?: Function): void;
    }

    export function listen(port: number, callback?: Function): void;
    export var events: HarnessEvents;
    export var config: {
        timeoutMS: number;
        retryMS: number;
    };
}