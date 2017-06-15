import { EventEmitter } from 'events';


export interface Media {

    //load media file from $url
    load(url: string): void;

    //get current loaded media
    getUrl(): string;

    //play current media
    play(): void;

    //pause current media
    pause(): void;

    //set current playing time
    setCurrentTime(percent: number): void;

    //get current playing time
    getCurrentTime(): number;

    //get media duration
    getDuration(): number;

    //set media auto-loop or not
    setLoop(bool: boolean): void;

    isPaused(): boolean;

    isPlaying(): boolean;

    isLoop(): boolean;

    isEnded(): boolean;

    isLoaded(): boolean;

    on(type: 'play', listener: () => void): void;
    on(type: 'load', listener: () => void): void;
    on(type: 'ended', listener: () => void): void;
    on(type: 'timeupdate', listener: (curtime: number) => void): void;
    on(type: string, listener: Function): void;

    once(type: 'play', listener: () => void): void;
    once(type: 'load', listener: () => void): void;
    once(type: 'ended', listener: () => void): void;
    once(type: 'timeupdate', listener: (curtime: number) => void): void;
    once(type: string, listener: Function): void;

}
