export interface ChartInstance {
    resize(): void;
    dispose(): void;
    setOption(option: unknown, options?: { notMerge?: boolean }): void;
}

export interface MotionPreference {
    readonly matches: boolean;
    addEventListener(type: "change", listener: () => void): void;
    removeEventListener(type: "change", listener: () => void): void;
}

export interface ResizeObserverLike {
    observe(target: Element): void;
    disconnect(): void;
}

interface MountChartOptions<TPayload> {
    root: Element;
    chart: ChartInstance;
    payload: TPayload;
    motionPreference: MotionPreference;
    createOption(payload: TPayload, reducedMotion: boolean): unknown;
    createResizeObserver(callback: () => void): ResizeObserverLike;
}

export function mountChart<TPayload>({
    root,
    chart,
    payload,
    motionPreference,
    createOption,
    createResizeObserver,
}: MountChartOptions<TPayload>) {
    const applyOption = () => {
        chart.setOption(createOption(payload, motionPreference.matches), {
            notMerge: true,
        });
    };
    const observer = createResizeObserver(() => chart.resize());

    applyOption();
    observer.observe(root);
    motionPreference.addEventListener("change", applyOption);

    return () => {
        motionPreference.removeEventListener("change", applyOption);
        observer.disconnect();
        chart.dispose();
    };
}
