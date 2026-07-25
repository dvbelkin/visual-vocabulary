import {
    BoxplotChart,
    CandlestickChart,
    CustomChart,
    GraphChart,
    ParallelChart,
    PictorialBarChart,
    PieChart,
    RadarChart,
    SankeyChart,
    SunburstChart,
    TreemapChart,
} from "echarts/charts";
import { use } from "echarts/core";

export function registerSpecializedCharts() {
    use([
        BoxplotChart,
        CandlestickChart,
        CustomChart,
        GraphChart,
        ParallelChart,
        PictorialBarChart,
        PieChart,
        RadarChart,
        SankeyChart,
        SunburstChart,
        TreemapChart,
    ]);
}
