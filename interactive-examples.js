const interactiveExamples = (() => {
  const palette = ["#175EA8", "#C94F14", "#247A3B", "#8D3F80", "#C98A00", "#626762"];
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг"];
  const products = ["Альфа", "Бета", "Гамма", "Дельта", "Эпсилон"];

  const axis = {
    axisLine: { lineStyle: { color: "#90908a" } },
    axisLabel: { color: "#3f3f3b" },
    splitLine: { lineStyle: { color: "#e5e5e0" } }
  };

  const base = (title) => ({
    animationDuration: 500,
    color: palette,
    title: { text: title, left: 12, top: 8, textStyle: { fontSize: 16, fontWeight: 650 } },
    tooltip: { trigger: "item", confine: true },
    textStyle: { fontFamily: 'Inter, "Segoe UI", Arial, sans-serif', color: "#171717" }
  });

  function bar(title, horizontal = false, diverging = false, stacked = false) {
    const values = diverging ? [-18, -7, 4, 13, 22] : [46, 39, 31, 24, 17];
    const series = stacked
      ? [
          { name: "Не согласны", type: "bar", stack: "total", data: [-28, -18, -12, -8, -5] },
          { name: "Нейтральны", type: "bar", stack: "total", data: [12, 16, 18, 13, 9] },
          { name: "Согласны", type: "bar", stack: "total", data: [60, 55, 48, 42, 35] }
        ]
      : [{ type: "bar", data: values, itemStyle: { color: (p) => values[p.dataIndex] < 0 ? palette[1] : palette[0] } }];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: stacked ? { top: 40 } : undefined,
      grid: { left: horizontal ? 88 : 46, right: 24, top: stacked ? 82 : 58, bottom: 42 },
      xAxis: horizontal ? { ...axis, type: "value" } : { ...axis, type: "category", data: products },
      yAxis: horizontal ? { ...axis, type: "category", data: products } : { ...axis, type: "value" },
      series
    };
  }

  function line(title, area = false, uncertainty = false) {
    const data = [21, 25, 23, 31, 35, 33, 42, 47];
    const series = [{
      name: "Значение",
      type: "line",
      smooth: false,
      symbolSize: 7,
      data,
      areaStyle: area ? { opacity: 0.18 } : undefined,
      markLine: { silent: true, data: [{ type: "average", name: "Среднее" }] }
    }];
    if (uncertainty) {
      series.push(
        { name: "Верхняя граница", type: "line", symbol: "none", lineStyle: { opacity: 0 }, areaStyle: { opacity: 0.12 }, stack: "band", data: [3, 3, 4, 5, 6, 8, 11, 14] },
        { name: "Нижняя граница", type: "line", symbol: "none", lineStyle: { opacity: 0 }, areaStyle: { opacity: 0.12 }, stack: "band", data: data.map((v, i) => v - [3,3,4,5,6,8,11,14][i]) }
      );
    }
    return {
      ...base(title),
      tooltip: { trigger: "axis" },
      grid: { left: 48, right: 24, top: 62, bottom: 58 },
      xAxis: { ...axis, type: "category", data: months },
      yAxis: { ...axis, type: "value" },
      dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 8 }],
      series
    };
  }

  function scatter(title, bubbles = false, connected = false) {
    const points = [[12,18,12],[18,25,18],[24,23,10],[31,35,24],[42,39,15],[48,52,28],[61,57,20],[70,69,32]];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `X: ${p.value[0]}<br>Y: ${p.value[1]}${bubbles ? `<br>Размер: ${p.value[2]}` : ""}` },
      brush: { toolbox: ["rect", "polygon", "clear"], xAxisIndex: "all", yAxisIndex: "all" },
      grid: { left: 48, right: 25, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "value", name: "Фактор X" },
      yAxis: { ...axis, type: "value", name: "Результат Y" },
      series: [{
        type: connected ? "line" : "scatter",
        data: points,
        symbolSize: bubbles ? (v) => Math.max(10, v[2]) : 11,
        lineStyle: connected ? { width: 2 } : undefined
      }]
    };
  }

  function pie(title, doughnut = false, rose = false) {
    return {
      ...base(title),
      legend: { bottom: 8 },
      series: [{
        type: "pie",
        radius: doughnut ? ["38%", "68%"] : ["0%", "68%"],
        roseType: rose ? "radius" : undefined,
        center: ["50%", "48%"],
        label: { formatter: "{b}\n{d}%" },
        data: [
          { name: "Продукт", value: 38 }, { name: "Сервис", value: 27 },
          { name: "Логистика", value: 19 }, { name: "Прочее", value: 16 }
        ],
        emphasis: { scale: true, scaleSize: 8 }
      }]
    };
  }

  function heatmap(title, calendar = false) {
    if (calendar) {
      const data = Array.from({ length: 120 }, (_, i) => {
        const date = new Date(2026, 0, i + 1);
        return [date.toISOString().slice(0, 10), Math.round(20 + 70 * Math.abs(Math.sin(i / 11)))];
      });
      return {
        ...base(title),
        visualMap: { min: 0, max: 100, orient: "horizontal", left: "center", bottom: 8, inRange: { color: ["#eef4fa", palette[0]] } },
        calendar: { top: 70, left: 38, right: 22, cellSize: ["auto", 18], range: ["2026-01-01", "2026-04-30"], itemStyle: { borderColor: "#fff" } },
        series: [{ type: "heatmap", coordinateSystem: "calendar", data }]
      };
    }
    const data = [];
    for (let x = 0; x < 6; x += 1) for (let y = 0; y < 5; y += 1) data.push([x, y, Math.round(100 * Math.abs(Math.sin(x + y / 2)))]);
    return {
      ...base(title),
      tooltip: { position: "top" },
      grid: { left: 72, right: 28, top: 62, bottom: 54 },
      xAxis: { ...axis, type: "category", data: ["Пн","Вт","Ср","Чт","Пт","Сб"] },
      yAxis: { ...axis, type: "category", data: ["Утро","День","Вечер","Ночь","Поздно"] },
      visualMap: { min: 0, max: 100, calculable: true, orient: "horizontal", left: "center", bottom: 4, inRange: { color: ["#eef4fa", palette[0]] } },
      series: [{ type: "heatmap", data }]
    };
  }

  function distribution(title, box = false) {
    if (box) {
      return {
        ...base(title),
        tooltip: { trigger: "item" },
        grid: { left: 48, right: 24, top: 62, bottom: 42 },
        xAxis: { ...axis, type: "category", data: products },
        yAxis: { ...axis, type: "value" },
        series: [{ type: "boxplot", data: [[12,22,31,39,52],[18,26,35,47,61],[9,19,29,41,67],[21,31,38,49,58],[13,24,33,44,54]] }]
      };
    }
    const values = [12,14,15,17,18,18,19,21,22,22,23,24,25,25,26,27,29,31,34,38,45,52];
    return {
      ...base(title),
      tooltip: { trigger: "axis" },
      grid: { left: 48, right: 24, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "category", data: ["10–15","15–20","20–25","25–30","30–40","40+"] },
      yAxis: { ...axis, type: "value", name: "Частота" },
      series: [{ type: "bar", data: [3,6,7,3,2,1], barCategoryGap: "4%" }]
    };
  }


  function normalizedStacked(title) {
    const groups = ["Регион A", "Регион B", "Регион C", "Регион D"];
    const seriesData = [
      { name: "Продукт", values: [42, 30, 24, 36] },
      { name: "Сервис", values: [28, 35, 31, 22] },
      { name: "Логистика", values: [18, 20, 27, 26] },
      { name: "Прочее", values: [12, 15, 18, 16] }
    ];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => `${v}%` },
      legend: { top: 40 },
      grid: { left: 86, right: 38, top: 82, bottom: 34 },
      xAxis: { ...axis, type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } },
      yAxis: { ...axis, type: "category", data: groups },
      series: seriesData.map((item) => ({
        name: item.name,
        type: "bar",
        stack: "share",
        data: item.values,
        emphasis: { focus: "series" },
        label: { show: true, formatter: ({ value }) => value >= 15 ? `${value}%` : "" }
      }))
    };
  }

  function clipPolygon(polygon, a, b, c) {
    const inside = ([x, y]) => a * x + b * y <= c + 1e-8;
    const intersection = (p, q) => {
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const denominator = a * dx + b * dy;
      if (Math.abs(denominator) < 1e-10) return p;
      const t = (c - a * p[0] - b * p[1]) / denominator;
      return [p[0] + t * dx, p[1] + t * dy];
    };
    const result = [];
    polygon.forEach((current, index) => {
      const previous = polygon[(index + polygon.length - 1) % polygon.length];
      const currentInside = inside(current);
      const previousInside = inside(previous);
      if (currentInside !== previousInside) result.push(intersection(previous, current));
      if (currentInside) result.push(current);
    });
    return result;
  }

  function voronoiCells(points) {
    return points.map((point, pointIndex) => {
      let polygon = [[0, 0], [100, 0], [100, 100], [0, 100]];
      points.forEach((other, otherIndex) => {
        if (otherIndex === pointIndex) return;
        const a = other[0] - point[0];
        const b = other[1] - point[1];
        const c = (other[0] ** 2 + other[1] ** 2 - point[0] ** 2 - point[1] ** 2) / 2;
        polygon = clipPolygon(polygon, a, b, c);
      });
      return polygon;
    });
  }

  function voronoi(title) {
    const points = [
      [17, 24, 31, "Север"], [39, 19, 18, "Запад"], [68, 20, 27, "Юг"],
      [84, 47, 14, "Восток"], [57, 51, 36, "Центр"], [24, 62, 22, "Пригород"],
      [46, 83, 17, "Новые районы"], [77, 79, 25, "Деловой кластер"]
    ];
    const cells = voronoiCells(points);
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.data.name}: ${p.data.value[2]}%` },
      grid: { left: 18, right: 18, top: 54, bottom: 18 },
      xAxis: { type: "value", min: 0, max: 100, show: false },
      yAxis: { type: "value", min: 0, max: 100, show: false },
      series: [{
        type: "custom",
        coordinateSystem: "cartesian2d",
        data: points.map((point, index) => ({ value: point, name: point[3], cell: cells[index], itemStyle: { color: palette[index % palette.length] } })),
        renderItem: (params, api) => {
          const item = { name: points[params.dataIndex][3], cell: cells[params.dataIndex] };
          const center = api.coord([api.value(0), api.value(1)]);
          return {
            type: "group",
            children: [
              {
                type: "polygon",
                shape: { points: item.cell.map((p) => api.coord(p)) },
                style: api.style({ stroke: "#fff", lineWidth: 3, opacity: 0.84 }),
                emphasis: { style: { opacity: 1, lineWidth: 4 } }
              },
              { type: "circle", shape: { cx: center[0], cy: center[1], r: 4 }, style: { fill: "#171717" } },
              { type: "text", style: { x: center[0], y: center[1] + 15, text: item.name, textAlign: "center", fill: "#171717", font: "12px Inter, sans-serif" } }
            ]
          };
        }
      }]
    };
  }

  function semicircle(title) {
    return {
      ...base(title),
      legend: { bottom: 6 },
      series: [{
        type: "pie",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "72%"],
        radius: ["28%", "78%"],
        label: { formatter: "{b}\n{c} мест" },
        data: [
          { name: "Партия A", value: 42 },
          { name: "Партия B", value: 31 },
          { name: "Партия C", value: 18 },
          { name: "Прочие", value: 9 }
        ],
        emphasis: { scale: true, scaleSize: 8 }
      }]
    };
  }

  function symbolGrid(title) {
    const segments = [
      { name: "Продукт", count: 38, color: palette[0] },
      { name: "Сервис", count: 27, color: palette[1] },
      { name: "Логистика", count: 19, color: palette[2] },
      { name: "Прочее", count: 16, color: palette[5] }
    ];
    const data = [];
    let offset = 0;
    segments.forEach((segment) => {
      for (let i = 0; i < segment.count; i += 1) {
        const index = offset + i;
        data.push({ name: segment.name, value: [index % 10, 9 - Math.floor(index / 10), index + 1], itemStyle: { color: segment.color } });
      }
      offset += segment.count;
    });
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.name}<br>Ячейка ${p.value[2]} из 100` },
      legend: { bottom: 3, data: segments.map((s) => s.name) },
      grid: { left: "18%", right: "18%", top: 55, bottom: 52 },
      xAxis: { type: "value", min: -0.5, max: 9.5, show: false },
      yAxis: { type: "value", min: -0.5, max: 9.5, show: false },
      series: segments.map((segment) => ({
        name: segment.name,
        type: "scatter",
        symbol: "roundRect",
        symbolSize: 22,
        data: data.filter((item) => item.name === segment.name),
        emphasis: { scale: 1.35 }
      }))
    };
  }

  function venn(title) {
    const sets = [
      { name: "Python", value: 62, center: [42, 52], color: palette[0] },
      { name: "SQL", value: 55, center: [58, 52], color: palette[1] },
      { name: "BI", value: 39, center: [50, 68], color: palette[2] }
    ];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.name}: ${p.value[2]} студентов` },
      grid: { left: 20, right: 20, top: 52, bottom: 18 },
      xAxis: { type: "value", min: 0, max: 100, show: false },
      yAxis: { type: "value", min: 0, max: 100, show: false },
      series: [{
        type: "custom",
        coordinateSystem: "cartesian2d",
        data: sets.map((set) => ({ name: set.name, value: [...set.center, set.value], itemStyle: { color: set.color } })),
        renderItem: (params, api) => {
          const set = sets[params.dataIndex];
          const center = api.coord([api.value(0), api.value(1)]);
          const radius = Math.min(api.size([28, 0])[0], api.size([0, 28])[1]);
          return {
            type: "group",
            children: [
              { type: "circle", shape: { cx: center[0], cy: center[1], r: radius }, style: api.style({ opacity: 0.42, stroke: set.color, lineWidth: 3 }), emphasis: { style: { opacity: 0.62 } } },
              { type: "text", style: { x: center[0], y: center[1] - radius * 0.72, text: set.name, textAlign: "center", fill: "#171717", font: "600 13px Inter, sans-serif" } }
            ]
          };
        }
      }],
      graphic: [{ type: "text", left: "center", top: "52%", style: { text: "18", font: "700 18px Inter, sans-serif", fill: "#171717", textAlign: "center" } }]
    };
  }

  function waterfall(title) {
    const labels = ["Начало", "Продажи", "Возвраты", "Расходы", "Экономия", "Итог"];
    const changes = [80, 34, -12, -25, 9, 86];
    const visible = [80, 34, 12, 25, 9, 86];
    const helper = [0, 80, 102, 77, 77, 0];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (items) => {
        const item = items.find((entry) => entry.seriesName !== "База");
        return item ? `${item.axisValue}<br>${item.seriesName}: ${changes[item.dataIndex] > 0 && item.dataIndex > 0 && item.dataIndex < changes.length - 1 ? "+" : ""}${changes[item.dataIndex]}` : "";
      } },
      grid: { left: 48, right: 24, top: 62, bottom: 44 },
      xAxis: { ...axis, type: "category", data: labels },
      yAxis: { ...axis, type: "value" },
      series: [
        { name: "База", type: "bar", stack: "waterfall", silent: true, itemStyle: { color: "transparent" }, emphasis: { itemStyle: { color: "transparent" } }, data: helper },
        {
          name: "Изменение",
          type: "bar",
          stack: "waterfall",
          data: visible,
          itemStyle: { color: (p) => p.dataIndex === 0 || p.dataIndex === visible.length - 1 ? palette[0] : changes[p.dataIndex] >= 0 ? palette[2] : palette[1] },
          label: { show: true, position: "top", formatter: ({ dataIndex }) => dataIndex === 0 || dataIndex === visible.length - 1 ? changes[dataIndex] : `${changes[dataIndex] > 0 ? "+" : ""}${changes[dataIndex]}` }
        }
      ]
    };
  }


  function violin(title) {
    const groups = ["Группа A", "Группа B", "Группа C"];
    const densities = [
      [[12,.04],[18,.16],[24,.38],[30,.72],[36,1],[42,.82],[48,.46],[54,.18],[60,.05]],
      [[12,.03],[18,.09],[24,.24],[30,.58],[36,.9],[42,1],[48,.74],[54,.34],[60,.1]],
      [[12,.08],[18,.3],[24,.76],[30,1],[36,.68],[42,.35],[48,.2],[54,.1],[60,.03]]
    ];
    return {
      ...base(title),
      tooltip: { formatter: (p) => p.name + "<br>Значение: " + p.value[1] },
      grid: { left: 52, right: 24, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "category", data: groups },
      yAxis: { ...axis, type: "value", name: "Значение", min: 8, max: 64 },
      series: [{
        type: "custom",
        data: groups.map((name, i) => ({ name, value: [i, 36] })),
        renderItem: (params, api) => {
          const i = params.dataIndex;
          const center = api.coord([i, 0])[0];
          const halfWidth = Math.min(api.size([1, 0])[0] * .38, 54);
          const left = densities[i].map(([v,d]) => [center - d * halfWidth, api.coord([i,v])[1]]);
          const right = [...densities[i]].reverse().map(([v,d]) => [center + d * halfWidth, api.coord([i,v])[1]]);
          const median = api.coord([i, densities[i].reduce((best,p) => p[1] > best[1] ? p : best)[0]]);
          return { type: "group", children: [
            { type: "polygon", shape: { points: [...left, ...right] }, style: api.style({ fill: palette[i], opacity: .64, stroke: palette[i], lineWidth: 2 }) },
            { type: "line", shape: { x1: center-7, y1: median[1], x2: center+7, y2: median[1] }, style: { stroke: "#171717", lineWidth: 3 } }
          ]};
        }
      }]
    };
  }

  function populationPyramid(title) {
    const ages = ["80+","70–79","60–69","50–59","40–49","30–39","20–29","10–19","0–9"];
    const men = [-3,-5,-8,-11,-14,-17,-19,-16,-13];
    const women = [5,8,11,14,16,18,19,15,12];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => Math.abs(v) + " тыс." },
      legend: { top: 40 },
      grid: { left: 62, right: 34, top: 82, bottom: 38 },
      xAxis: { ...axis, type: "value", min: -22, max: 22, axisLabel: { formatter: (v) => Math.abs(v) } },
      yAxis: { ...axis, type: "category", data: ages },
      series: [
        { name: "Мужчины", type: "bar", stack: "population", data: men, itemStyle: { color: palette[0] } },
        { name: "Женщины", type: "bar", stack: "population", data: women, itemStyle: { color: palette[1] } }
      ]
    };
  }

  function observationStrip(title) {
    const values = [12,14,15,17,18,18,19,21,22,22,23,24,25,25,26,27,29,31,34,38,45,52];
    const data = values.map((v,i) => [v, ((i * 37) % 17 - 8) / 20]);
    return {
      ...base(title),
      tooltip: { formatter: (p) => "Наблюдение: " + p.value[0] },
      grid: { left: 48, right: 24, top: 70, bottom: 44 },
      xAxis: { ...axis, type: "value", name: "Значение" },
      yAxis: { min: -1, max: 1, show: false },
      series: [{ type: "scatter", data, symbolSize: 13, emphasis: { scale: 1.55 }, itemStyle: { opacity: .72 } }]
    };
  }

  function dotRange(title) {
    const names = ["Альфа","Бета","Гамма","Дельта","Эпсилон"];
    const ranges = [[12,31,52],[18,35,61],[9,29,67],[21,38,58],[13,33,54]];
    return {
      ...base(title),
      tooltip: { formatter: (p) => p.name + "<br>Минимум: " + p.value[1] + "<br>Уровень: " + p.value[2] + "<br>Максимум: " + p.value[3] },
      grid: { left: 86, right: 30, top: 62, bottom: 40 },
      xAxis: { ...axis, type: "value" },
      yAxis: { ...axis, type: "category", data: names },
      series: [{
        type: "custom",
        data: ranges.map((r,i) => ({ name: names[i], value: [i,...r] })),
        renderItem: (params, api) => {
          const y=api.coord([0,api.value(0)])[1], lo=api.coord([api.value(1),0])[0], mid=api.coord([api.value(2),0])[0], hi=api.coord([api.value(3),0])[0];
          return { type:"group", children:[
            { type:"line", shape:{x1:lo,y1:y,x2:hi,y2:y}, style:{stroke:"#90908a",lineWidth:4,lineCap:"round"} },
            { type:"circle", shape:{cx:lo,cy:y,r:5}, style:{fill:"#fff",stroke:palette[0],lineWidth:2} },
            { type:"circle", shape:{cx:hi,cy:y,r:5}, style:{fill:"#fff",stroke:palette[0],lineWidth:2} },
            { type:"circle", shape:{cx:mid,cy:y,r:7}, style:{fill:palette[1],stroke:"#fff",lineWidth:2} }
          ]};
        }
      }]
    };
  }

  function barcode(title) {
    const values = [7,9,12,14,15,17,18,18.5,19,21,22,22.4,23,24,25,25.3,26,27,29,31,34,38,45,52];
    return {
      ...base(title),
      tooltip: { formatter: (p) => "Наблюдение: " + p.value[0] },
      grid: { left: 48, right: 24, top: 70, bottom: 44 },
      xAxis: { ...axis, type: "value", name: "Значение" },
      yAxis: { min: 0, max: 1, show: false },
      series: [{
        type: "custom",
        data: values.map((v) => [v,.5]),
        renderItem: (params, api) => {
          const p=api.coord([api.value(0),.5]);
          return { type:"line", shape:{x1:p[0],y1:p[1]-44,x2:p[0],y2:p[1]+44}, style:api.style({stroke:palette[0],lineWidth:3,opacity:.68}) };
        }
      }]
    };
  }

  function cumulativeCurve(title) {
    const sorted = [7,9,12,14,15,17,18,19,21,22,23,24,25,26,27,29,31,34,38,45,52];
    const data = sorted.map((v,i) => [v, Math.round((i+1)/sorted.length*1000)/10]);
    return {
      ...base(title),
      tooltip: { trigger: "axis", valueFormatter: (v) => v + "%" },
      grid: { left: 54, right: 24, top: 62, bottom: 44 },
      xAxis: { ...axis, type: "value", name: "Значение" },
      yAxis: { ...axis, type: "value", min: 0, max: 100, name: "Накоплено, %", axisLabel: { formatter: "{value}%" } },
      series: [{ type: "line", step: "end", showSymbol: true, symbolSize: 7, data, areaStyle: { opacity: .12 } }]
    };
  }

  function columnLineTimeline(title) {
    const sales = [118, 132, 126, 151, 164, 158, 182, 196];
    const conversion = [2.8, 3.1, 2.9, 3.5, 3.8, 3.6, 4.2, 4.5];
    return {
      ...base(title),
      tooltip: { trigger: "axis" },
      legend: { top: 40 },
      grid: { left: 54, right: 58, top: 82, bottom: 42 },
      xAxis: { ...axis, type: "category", data: months },
      yAxis: [
        { ...axis, type: "value", name: "Продажи, млн ₽", min: 0 },
        { ...axis, type: "value", name: "Конверсия, %", min: 0, max: 5, axisLabel: { formatter: "{value}%" } }
      ],
      series: [
        { name: "Продажи", type: "bar", data: sales, barMaxWidth: 34 },
        { name: "Конверсия", type: "line", yAxisIndex: 1, data: conversion, symbolSize: 8, lineStyle: { width: 3 } }
      ]
    };
  }

  function columnTimeline(title) {
    const values = [72, 86, 79, 104, 118, 111, 136, 149];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 58, right: 24, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "category", data: months },
      yAxis: { ...axis, type: "value", min: 0, name: "Заказы, тыс." },
      series: [{
        name: "Заказы",
        type: "bar",
        data: values,
        barMaxWidth: 38,
        label: { show: true, position: "top" },
        emphasis: { focus: "series" }
      }]
    };
  }

  function multiAreaTimeline(title) {
    const seriesData = [
      { name: "Онлайн", values: [28, 32, 35, 39, 44, 48, 53, 58] },
      { name: "Магазины", values: [44, 46, 43, 48, 51, 49, 54, 56] },
      { name: "Партнёры", values: [17, 20, 19, 23, 25, 29, 31, 35] }
    ];
    return {
      ...base(title),
      tooltip: { trigger: "axis" },
      legend: { top: 40 },
      grid: { left: 54, right: 24, top: 82, bottom: 42 },
      xAxis: { ...axis, type: "category", boundaryGap: false, data: months },
      yAxis: { ...axis, type: "value", min: 0, name: "Продажи, млн ₽" },
      series: seriesData.map((item, index) => ({
        name: item.name,
        type: "line",
        stack: "total",
        symbol: "none",
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.68 },
        emphasis: { focus: "series" },
        data: item.values,
        itemStyle: { color: palette[index] }
      }))
    };
  }

  function connectedScatterTimeline(title) {
    const years = ["2022", "2023", "2024", "2025", "2026"];
    const trajectories = [
      { name: "Регион A", color: palette[0], values: [[34, 62], [39, 66], [47, 69], [56, 75], [64, 81]] },
      { name: "Регион B", color: palette[1], values: [[62, 43], [58, 49], [55, 57], [51, 66], [45, 72]] },
      { name: "Регион C", color: palette[2], values: [[28, 35], [35, 39], [43, 47], [52, 51], [61, 58]] }
    ];
    return {
      ...base(title),
      tooltip: {
        trigger: "item",
        formatter: (p) => `${p.seriesName}<br>${years[p.dataIndex]}<br>X: ${p.value[0]}<br>Y: ${p.value[1]}`
      },
      legend: { top: 40 },
      grid: { left: 58, right: 34, top: 82, bottom: 48 },
      xAxis: { ...axis, type: "value", min: 20, max: 70, name: "Охват, %" },
      yAxis: { ...axis, type: "value", min: 30, max: 85, name: "Лояльность, %" },
      series: trajectories.map((trajectory) => ({
        name: trajectory.name,
        type: "line",
        data: trajectory.values,
        symbol: "circle",
        symbolSize: 11,
        lineStyle: { width: 3, color: trajectory.color },
        itemStyle: { color: trajectory.color, borderColor: "#fff", borderWidth: 2 },
        endLabel: { show: true, formatter: trajectory.name, color: trajectory.color },
        label: {
          show: true,
          formatter: (p) => years[p.dataIndex],
          position: "top",
          fontSize: 10
        },
        emphasis: { focus: "series", scale: 1.35 }
      }))
    };
  }

  function candlestick(title) {
    const dates = ["15.07","16.07","17.07","18.07","19.07","22.07","23.07","24.07"];
    const prices = [
      [102,108,99,111], [108,105,103,112], [105,113,104,116], [113,118,110,121],
      [118,114,112,120], [114,121,113,124], [121,126,119,129], [126,123,120,128]
    ];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
      grid: { left: 54, right: 24, top: 62, bottom: 58 },
      xAxis: { ...axis, type: "category", data: dates, boundaryGap: true },
      yAxis: { ...axis, type: "value", scale: true, name: "Цена, ₽" },
      dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 8 }],
      series: [{
        name: "Цена",
        type: "candlestick",
        data: prices,
        itemStyle: {
          color: palette[2],
          color0: palette[1],
          borderColor: palette[2],
          borderColor0: palette[1]
        }
      }]
    };
  }

  function slopeTimeline(title) {
    const groups = [
      { name: "Альфа", values: [42, 61], color: palette[0] },
      { name: "Бета", values: [57, 49], color: palette[1] },
      { name: "Гамма", values: [31, 46], color: palette[2] },
      { name: "Дельта", values: [68, 55], color: palette[3] }
    ];
    return {
      ...base(title),
      tooltip: { trigger: "item", formatter: (p) => `${p.seriesName}<br>2024: ${p.data[0]}<br>2026: ${p.data[1]}` },
      legend: { top: 40 },
      grid: { left: 72, right: 72, top: 82, bottom: 38 },
      xAxis: { ...axis, type: "category", data: ["2024", "2026"], boundaryGap: false },
      yAxis: { ...axis, type: "value", min: 20, max: 75 },
      series: groups.map((group) => ({
        name: group.name,
        type: "line",
        data: group.values,
        symbolSize: 11,
        lineStyle: { width: 3, color: group.color },
        itemStyle: { color: group.color },
        label: { show: true, formatter: ({ seriesName }) => seriesName, position: "right" }
      }))
    };
  }

  function fanChart(title) {
    const periods = ["2024","2025","2026","2027","2028","2029","2030"];
    const median = [48,52,56,60,64,68,72];
    const lower90 = [48,52,50,48,46,43,40];
    const lower50 = [48,52,53,54,55,56,57];
    const band50 = [0,0,6,12,18,24,30];
    const band90 = [0,0,12,24,36,49,64];
    return {
      ...base(title),
      tooltip: { trigger: "axis" },
      legend: { top: 40, data: ["Медианный прогноз", "50% интервал", "90% интервал"] },
      grid: { left: 54, right: 24, top: 82, bottom: 42 },
      xAxis: { ...axis, type: "category", data: periods },
      yAxis: { ...axis, type: "value", min: 35, max: 105 },
      series: [
        { name: "Нижняя граница 90%", type: "line", stack: "fan90", symbol: "none", lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 }, data: lower90 },
        { name: "90% интервал", type: "line", stack: "fan90", symbol: "none", lineStyle: { opacity: 0 }, areaStyle: { color: palette[0], opacity: .14 }, data: band90 },
        { name: "Нижняя граница 50%", type: "line", stack: "fan50", symbol: "none", lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 }, data: lower50 },
        { name: "50% интервал", type: "line", stack: "fan50", symbol: "none", lineStyle: { opacity: 0 }, areaStyle: { color: palette[0], opacity: .3 }, data: band50 },
        { name: "Медианный прогноз", type: "line", data: median, symbolSize: 7, lineStyle: { width: 3, color: palette[0] }, markLine: { silent: true, data: [{ xAxis: "2026", label: { formatter: "Прогноз →" } }] } }
      ]
    };
  }

  function priestleyTimeline(title) {
    const rows = [
      ["Исследование", 0, 1, 5], ["Разработка", 1, 3, 9], ["Тестирование", 2, 7, 11],
      ["Пилот", 3, 10, 13], ["Внедрение", 4, 12, 17]
    ];
    const dates = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек","Янв","Фев","Мар","Апр","Май","Июн"];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.name}<br>${dates[p.value[1]]} → ${dates[p.value[2]]}` },
      grid: { left: 104, right: 24, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "value", min: 0, max: 17, interval: 1, axisLabel: { formatter: (v) => dates[v] || "" } },
      yAxis: { ...axis, type: "category", data: rows.map((r) => r[0]) },
      series: [{
        type: "custom",
        data: rows.map((r) => ({ name: r[0], value: [r[1], r[2], r[3]] })),
        renderItem: (params, api) => {
          const y = api.coord([0, api.value(0)])[1];
          const start = api.coord([api.value(1), 0])[0];
          const end = api.coord([api.value(2), 0])[0];
          const height = Math.min(22, api.size([0, 1])[1] * .58);
          return { type: "rect", shape: { x: start, y: y - height / 2, width: end - start, height, r: 5 }, style: api.style() };
        }
      }]
    };
  }

  function circleTimeline(title) {
    const events = [
      [0,0,18,"Запуск"], [1,1,32,"Релиз"], [2,0,12,"Обновление"], [2,2,26,"Выставка"],
      [3,2,46,"Кампания"], [4,1,22,"Партнёрство"], [5,2,35,"Конференция"],
      [6,0,16,"Обновление"], [7,1,54,"Крупный релиз"]
    ];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${months[p.value[0]]}: ${p.value[3]}<br>Масштаб: ${p.value[2]}` },
      grid: { left: 112, right: 28, top: 68, bottom: 46 },
      xAxis: {
        ...axis,
        type: "category",
        data: months,
        boundaryGap: true,
        axisPointer: { show: true, type: "line" }
      },
      yAxis: {
        ...axis,
        type: "category",
        data: ["Продукт","Бизнес","Коммуникации"],
        splitLine: { show: true, lineStyle: { color: "#e5e5e0" } }
      },
      series: [{
        name: "События",
        type: "scatter",
        data: events,
        symbolSize: (v) => 8 + Math.sqrt(v[2]) * 5,
        itemStyle: { opacity: .72, borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          formatter: (p) => p.value[2] >= 32 ? p.value[3] : "",
          position: "top",
          fontSize: 10
        },
        emphasis: { scale: 1.35, label: { show: true, formatter: (p) => p.value[3] } }
      }]
    };
  }

  function seismogram(title) {
    const values = [3,8,5,18,7,42,11,6,95,14,8,31,5,62,9,17,4,78,12,6,26,4,51,8];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `Событие ${p.dataIndex + 1}<br>Величина: ${p.value[1]}` },
      grid: { left: 54, right: 24, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "value", min: 0, max: values.length - 1, name: "Время" },
      yAxis: { ...axis, type: "value", min: 0, max: 2.2, axisLabel: { show: false }, splitLine: { show: false } },
      series: [{
        type: "custom",
        data: values.map((v, i) => [i, Math.log10(v + 1), v]),
        renderItem: (params, api) => {
          const basePoint = api.coord([api.value(0), 0]);
          const topPoint = api.coord([api.value(0), api.value(1)]);
          return {
            type: "group",
            children: [
              { type: "line", shape: { x1: basePoint[0], y1: basePoint[1], x2: topPoint[0], y2: topPoint[1] }, style: { stroke: palette[0], lineWidth: 3 } },
              { type: "circle", shape: { cx: topPoint[0], cy: topPoint[1], r: 4 }, style: { fill: palette[1] } }
            ]
          };
        }
      }]
    };
  }

  function hierarchy(title, sunburst = false) {
    const data = [
      { name: "Продукты", value: 42, children: [{ name: "A", value: 24 }, { name: "B", value: 18 }] },
      { name: "Сервисы", value: 35, children: [{ name: "C", value: 20 }, { name: "D", value: 15 }] },
      { name: "Прочее", value: 23, children: [{ name: "E", value: 13 }, { name: "F", value: 10 }] }
    ];
    return {
      ...base(title),
      tooltip: { formatter: "{b}: {c}" },
      series: [{
        type: sunburst ? "sunburst" : "treemap",
        data,
        radius: sunburst ? ["12%", "76%"] : undefined,
        roam: sunburst ? undefined : true,
        label: { show: true, formatter: "{b}" }
      }]
    };
  }

  function radar(title) {
    return {
      ...base(title),
      legend: { bottom: 8 },
      radar: { radius: "62%", indicator: ["Цена","Качество","Скорость","Сервис","Выбор"].map((name) => ({ name, max: 100 })) },
      series: [{ type: "radar", data: [{ name: "Альфа", value: [75,88,62,81,67] }, { name: "Бета", value: [61,73,84,66,78] }] }]
    };
  }

  function sankey(title) {
    return {
      ...base(title),
      tooltip: { trigger: "item", triggerOn: "mousemove" },
      series: [{
        type: "sankey",
        left: 18, right: 18, top: 58, bottom: 18,
        emphasis: { focus: "adjacency" },
        data: ["Визиты","Каталог","Карточка","Корзина","Покупка","Уход"].map((name) => ({ name })),
        links: [
          ["Визиты","Каталог",100],["Каталог","Карточка",72],["Каталог","Уход",28],
          ["Карточка","Корзина",39],["Карточка","Уход",33],["Корзина","Покупка",27],["Корзина","Уход",12]
        ].map(([source,target,value]) => ({ source,target,value }))
      }]
    };
  }

  function network(title) {
    const nodes = products.map((name, i) => ({ name, value: 10 + i * 4, symbolSize: 20 + i * 4, category: i % 2 }));
    return {
      ...base(title),
      legend: [{ data: ["Группа 1", "Группа 2"], bottom: 8 }],
      series: [{
        type: "graph", layout: "force", roam: true, draggable: true,
        categories: [{ name: "Группа 1" }, { name: "Группа 2" }],
        data: nodes,
        links: [[0,1],[0,2],[1,3],[2,3],[2,4],[3,4]].map(([s,t]) => ({ source: s, target: t })),
        force: { repulsion: 150, edgeLength: 80 },
        label: { show: true }
      }]
    };
  }

  function gauge(title) {
    return {
      ...base(title),
      series: [{
        type: "gauge", startAngle: 205, endAngle: -25, min: 0, max: 100,
        progress: { show: true, width: 14 }, axisLine: { lineStyle: { width: 14 } },
        pointer: { show: false }, splitLine: { show: false }, axisTick: { show: false },
        detail: { valueAnimation: true, formatter: "{value}%\nк цели", fontSize: 20 },
        data: [{ value: 73 }]
      }]
    };
  }

  const mapRegions = [
    { name: "Северо-Запад", value: 42, points: [[8,57],[22,68],[35,64],[33,49],[18,45]] },
    { name: "Центр", value: 78, points: [[18,45],[33,49],[45,43],[42,28],[26,25],[13,34]] },
    { name: "Север", value: 31, points: [[35,64],[55,70],[68,61],[61,47],[45,43],[33,49]] },
    { name: "Поволжье", value: 63, points: [[42,28],[45,43],[61,47],[66,31],[57,20]] },
    { name: "Юг", value: 55, points: [[13,34],[26,25],[42,28],[37,12],[18,10],[7,22]] },
    { name: "Урал", value: 48, points: [[61,47],[68,61],[82,57],[86,38],[66,31]] },
    { name: "Сибирь", value: 26, points: [[66,31],[86,38],[96,26],[91,9],[70,10],[57,20]] }
  ];

  const mapBase = (title) => ({
    ...base(title),
    grid: { left: 26, right: 26, top: 66, bottom: 30 },
    xAxis: { type: "value", min: 0, max: 102, show: false },
    yAxis: { type: "value", min: 0, max: 76, show: false }
  });

  function polygonSeries(regions, colorFor, label = true) {
    return {
      type: "custom",
      data: regions.map((region, index) => [index, region.value]),
      renderItem: (params, api) => {
        const region = regions[api.value(0)];
        const points = region.points.map((point) => api.coord(point));
        const center = points.reduce((sum, point) => [sum[0] + point[0] / points.length, sum[1] + point[1] / points.length], [0, 0]);
        return {
          type: "group",
          children: [
            {
              type: "polygon",
              shape: { points },
              style: { fill: colorFor(region, api.value(0)), stroke: "#fff", lineWidth: 2 },
              emphasis: { style: { stroke: "#171717", lineWidth: 2.5 } }
            },
            ...(label ? [{
              type: "text",
              style: { x: center[0], y: center[1], text: region.name, fill: "#171717", fontSize: 10, align: "center", verticalAlign: "middle" }
            }] : [])
          ]
        };
      }
    };
  }

  function choroplethMap(title) {
    const colors = ["#e9f1f8","#c7dced","#8db9d9","#4d8bbb","#175ea8"];
    return {
      ...mapBase(title),
      tooltip: { formatter: (p) => `${mapRegions[p.value[0]].name}<br>Показатель: ${p.value[1]}%` },
      visualMap: { min: 20, max: 80, orient: "horizontal", left: "center", bottom: 4, inRange: { color: colors }, text: ["80%", "20%"] },
      series: [polygonSeries(mapRegions, (region) => colors[Math.min(4, Math.floor((region.value - 20) / 13))])]
    };
  }

  function proportionalSymbolMap(title) {
    const cities = [[24,42,86,"Столица"],[47,47,52,"Север"],[68,35,34,"Восток"],[31,20,24,"Юг"],[82,20,17,"Дальний"]];
    return {
      ...mapBase(title),
      tooltip: { formatter: (p) => `${p.value[3]}<br>Объём: ${p.value[2]} тыс.` },
      series: [
        polygonSeries(mapRegions, () => "#edf0ee", false),
        { type: "scatter", data: cities, symbolSize: (v) => 7 + Math.sqrt(v[2]) * 3.2, itemStyle: { color: palette[0], opacity: .72, borderColor: "#fff", borderWidth: 1.5 }, label: { show: true, formatter: (p) => p.value[3], position: "top", color: "#171717" }, emphasis: { scale: 1.25 } }
      ]
    };
  }

  function flowMap(title) {
    const hub = [28,38];
    const destinations = [[50,58,38,"Север"],[66,42,72,"Восток"],[82,20,28,"Дальний"],[44,17,51,"Юг"]];
    return {
      ...mapBase(title),
      tooltip: { formatter: (p) => p.seriesType === "lines" ? `${p.data.name}: ${p.data.value} тыс.` : p.value[3] },
      series: [
        polygonSeries(mapRegions, () => "#eef1ef", false),
        {
          type: "lines", coordinateSystem: "cartesian2d", zlevel: 2,
          effect: { show: true, period: 4, trailLength: .25, symbol: "arrow", symbolSize: 7 },
          lineStyle: { color: palette[0], opacity: .62, curveness: .18 },
          data: destinations.map((d) => ({ name: `Центр → ${d[3]}`, value: d[2], coords: [hub, [d[0],d[1]]], lineStyle: { width: 1 + d[2] / 18 } }))
        },
        { type: "scatter", data: [[...hub,90,"Центр"], ...destinations], symbolSize: (v) => 8 + Math.sqrt(v[2]) * 1.5, label: { show: true, formatter: (p) => p.value[3], position: "top", color: "#171717" }, itemStyle: { color: palette[1] } }
      ]
    };
  }

  function contourMap(title) {
    const contours = [
      { value: 10, points: [[10,30],[22,45],[38,54],[57,55],[76,46],[93,31]], color: "#9ecae1" },
      { value: 20, points: [[12,24],[28,34],[43,43],[58,44],[73,37],[91,22]], color: "#5fa2ce" },
      { value: 30, points: [[18,18],[32,24],[46,32],[59,33],[73,28],[85,17]], color: "#175ea8" },
      { value: 40, points: [[30,13],[43,18],[55,24],[68,20],[76,12]], color: "#c94f14" }
    ];
    return {
      ...mapBase(title),
      tooltip: { formatter: (p) => `Изолиния: ${p.value[1]} ед.` },
      series: [
        polygonSeries(mapRegions, () => "#f1f2ef", false),
        {
          type: "custom", data: contours.map((line, index) => [index, line.value]),
          renderItem: (params, api) => {
            const line = contours[api.value(0)];
            return { type: "polyline", shape: { points: line.points.map((point) => api.coord(point)), smooth: .35 }, style: { fill: null, stroke: line.color, lineWidth: 3 }, textContent: { type: "text", style: { text: `${line.value}`, fill: line.color, fontWeight: 700 } }, textConfig: { position: "end", distance: 5 } };
          }
        }
      ]
    };
  }

  function equalisedCartogram(title) {
    const cells = [
      ["СЗ",1,3,42],["Ц",1,2,78],["Ю",1,1,55],["С",2,3,31],
      ["П",2,2,63],["У",3,2,48],["Сиб",4,2,26]
    ];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.value[0]}<br>Показатель: ${p.value[3]}%` },
      grid: { left: "18%", right: "18%", top: 76, bottom: 38 },
      xAxis: { min: .4, max: 4.6, show: false }, yAxis: { min: .4, max: 3.6, show: false },
      visualMap: { min: 20, max: 80, orient: "horizontal", left: "center", bottom: 4, inRange: { color: ["#e9f1f8","#175ea8"] } },
      series: [{
        type: "custom", data: cells,
        renderItem: (params, api) => {
          const center = api.coord([api.value(1), api.value(2)]);
          return { type: "group", children: [
            { type: "rect", shape: { x: center[0]-24, y: center[1]-24, width: 48, height: 48, r: 5 }, style: api.style({ stroke: "#fff", lineWidth: 2 }) },
            { type: "text", style: { x: center[0], y: center[1], text: api.value(0), fill: "#fff", align: "center", verticalAlign: "middle", fontWeight: 700 } }
          ]};
        }, encode: { tooltip: [0,3] }
      }]
    };
  }

  function scaledCartogram(title) {
    const regions = [
      [18,45,85,"Центр"],[42,52,54,"Север"],[66,43,39,"Урал"],
      [82,30,23,"Сибирь"],[35,22,47,"Юг"],[58,19,31,"Поволжье"]
    ];
    return {
      ...mapBase(title),
      tooltip: { formatter: (p) => `${p.value[3]}<br>Население: ${p.value[2]} млн` },
      series: [{
        type: "scatter", data: regions, symbol: "rect",
        symbolSize: (v) => { const side = 13 + Math.sqrt(v[2]) * 4.4; return [side, side]; },
        itemStyle: { color: palette[0], opacity: .78, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, formatter: (p) => `${p.value[3]}\n${p.value[2]}`, color: "#fff", fontSize: 10 },
        emphasis: { scale: 1.18 }
      }]
    };
  }

  function dotDensityMap(title) {
    const points = Array.from({ length: 150 }, (_, i) => {
      const cluster = i % 3;
      const centers = [[27,40],[54,47],[73,24]];
      const angle = i * 2.399;
      const radius = 2 + (i % 19) * .55;
      return [centers[cluster][0] + Math.cos(angle) * radius, centers[cluster][1] + Math.sin(angle) * radius, cluster];
    });
    return {
      ...mapBase(title),
      tooltip: { formatter: "Одна точка = 1 000 жителей" },
      series: [
        polygonSeries(mapRegions, () => "#eef1ef", false),
        { type: "scatter", data: points, symbolSize: 4.5, itemStyle: { color: (p) => [palette[0],palette[1],palette[2]][p.value[2]], opacity: .62 } }
      ]
    };
  }

  function spatialHeatMap(title) {
    const data = [];
    for (let x = 8; x <= 94; x += 7) for (let y = 10; y <= 66; y += 7) {
      const value = 80 * Math.exp(-((x-28)**2+(y-42)**2)/260) + 65 * Math.exp(-((x-67)**2+(y-27)**2)/300);
      data.push([x,y,Math.round(value)]);
    }
    return {
      ...mapBase(title),
      tooltip: { formatter: (p) => `Интенсивность: ${p.value[2]}` },
      visualMap: { min: 0, max: 85, orient: "horizontal", left: "center", bottom: 4, inRange: { color: ["#f6f1d8","#f2bd63","#d85b35","#781f3a"] } },
      series: [
        polygonSeries(mapRegions, () => "#f1f2ef", false),
        { type: "heatmap", data, pointSize: 22, blurSize: 32, emphasis: { itemStyle: { borderColor: "#171717", borderWidth: 1 } } }
      ]
    };
  }

  function processWaterfall(title) {
    const stages = ["Старт","Продажи","Возвраты","Сервис","Расходы","Итог"];
    const changes = [120,35,-18,22,-41,118];
    const bases = [0,120,137,137,118,0];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (items) => { const item = items.find((p) => p.seriesName === "Изменение"); return `${item.axisValue}<br>${item.data.raw >= 0 ? "+" : ""}${item.data.raw}`; } },
      grid: { left: 52, right: 26, top: 64, bottom: 54 },
      xAxis: { ...axis, type: "category", data: stages },
      yAxis: { ...axis, type: "value", name: "Результат" },
      series: [
        { name: "База", type: "bar", stack: "total", data: bases, itemStyle: { color: "transparent" }, emphasis: { itemStyle: { color: "transparent" } }, tooltip: { show: false } },
        { name: "Изменение", type: "bar", stack: "total", data: changes.map((raw, index) => ({ value: Math.abs(raw), raw, itemStyle: { color: index === 0 || index === changes.length-1 ? palette[0] : raw >= 0 ? palette[2] : palette[1] } })), label: { show: true, position: "top", formatter: (p) => `${p.data.raw >= 0 ? "+" : ""}${p.data.raw}` } }
      ]
    };
  }

  function chordDiagram(title) {
    const names = ["Север","Центр","Юг","Восток","Запад"];
    const links = [[0,1,38],[0,3,16],[1,2,31],[1,3,25],[2,4,19],[3,4,27],[4,0,14]];
    return {
      ...base(title),
      tooltip: { formatter: (p) => p.dataType === "edge" ? `${names[p.data.source]} → ${names[p.data.target]}: ${p.data.value}` : names[p.dataIndex] },
      series: [{
        type: "graph", layout: "circular", circular: { rotateLabel: true }, roam: true,
        data: names.map((name, index) => ({ name, symbolSize: 34, itemStyle: { color: palette[index] } })),
        links: links.map(([source,target,value]) => ({ source, target, value, lineStyle: { width: 2 + value / 7, color: palette[source], opacity: .48, curveness: .45 } })),
        edgeSymbol: ["none","none"], label: { show: true, position: "outside" },
        lineStyle: { curveness: .45 }, emphasis: { focus: "adjacency", lineStyle: { opacity: .9 } }
      }]
    };
  }

  function orderedSymbols(title) {
    const data = [
      [94, "Альфа"], [76, "Бета"], [58, "Гамма"],
      [41, "Дельта"], [27, "Эпсилон"], [15, "Дзета"]
    ];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.value[1]}: ${p.value[0]}` },
      grid: { left: 86, right: 54, top: 62, bottom: 34 },
      xAxis: { ...axis, type: "value", min: 0, max: 105, name: "Значение" },
      yAxis: {
        ...axis,
        type: "category",
        inverse: true,
        data: data.map((item) => item[1])
      },
      series: [{
        type: "scatter",
        data,
        symbolSize: (value) => 8 + Math.sqrt(value[0]) * 4.5,
        itemStyle: { opacity: .76, borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          formatter: (p) => p.value[0],
          position: "right",
          color: "#171717",
          fontWeight: 650
        },
        emphasis: { scale: 1.25 }
      }]
    };
  }

  function rankingDotStrip(title) {
    const categories = ["Качество", "Цена", "Сервис"];
    const objects = [
      { name: "Альфа", values: [1, 4, 2], color: palette[0] },
      { name: "Бета", values: [3, 1, 4], color: palette[1] },
      { name: "Гамма", values: [2, 3, 1], color: palette[2] },
      { name: "Дельта", values: [4, 2, 3], color: palette[3] }
    ];
    return {
      ...base(title),
      tooltip: {
        formatter: (p) => `${p.seriesName}<br>${categories[p.value[1]]}: ${p.value[0]}-е место`
      },
      legend: { top: 40 },
      grid: { left: 92, right: 30, top: 82, bottom: 46 },
      xAxis: {
        ...axis,
        type: "value",
        min: .5,
        max: 4.5,
        interval: 1,
        inverse: true,
        name: "Место",
        axisLabel: { formatter: (value) => Number.isInteger(value) ? value : "" }
      },
      yAxis: { ...axis, type: "category", data: categories },
      series: objects.map((object) => ({
        name: object.name,
        type: "scatter",
        data: object.values.map((rank, categoryIndex) => [rank, categoryIndex]),
        symbolSize: 16,
        itemStyle: { color: object.color, borderColor: "#fff", borderWidth: 2 },
        emphasis: { scale: 1.45 }
      }))
    };
  }

  function rankChange(title) {
    const groups = [
      { name: "Альфа", ranks: [1, 3], color: palette[0] },
      { name: "Бета", ranks: [4, 1], color: palette[1] },
      { name: "Гамма", ranks: [2, 2], color: palette[2] },
      { name: "Дельта", ranks: [3, 5], color: palette[3] },
      { name: "Эпсилон", ranks: [5, 4], color: palette[4] }
    ];
    return {
      ...base(title),
      tooltip: {
        trigger: "item",
        formatter: (p) => `${p.seriesName}<br>2024: ${p.data[0]}-е место<br>2026: ${p.data[1]}-е место`
      },
      grid: { left: 86, right: 92, top: 64, bottom: 38 },
      xAxis: { ...axis, type: "category", data: ["2024", "2026"], boundaryGap: false },
      yAxis: {
        ...axis,
        type: "value",
        min: 1,
        max: 5,
        interval: 1,
        inverse: true,
        name: "Место"
      },
      series: groups.map((group) => ({
        name: group.name,
        type: "line",
        data: group.ranks,
        symbolSize: 11,
        lineStyle: { width: 3, color: group.color },
        itemStyle: { color: group.color },
        label: {
          show: true,
          formatter: ({ dataIndex }) => dataIndex === 1 ? group.name : "",
          position: "right",
          color: group.color
        },
        emphasis: { focus: "series" }
      }))
    };
  }

  function lollipop(title, horizontal = true) {
    const names = ["Альфа", "Бета", "Гамма", "Дельта", "Эпсилон", "Дзета"];
    const values = [92, 76, 63, 49, 34, 21];
    const stemSeries = {
      name: "Значение",
      type: "bar",
      data: values,
      barWidth: 3,
      itemStyle: { color: "#aeb5b0" },
      emphasis: { disabled: true },
      z: 1
    };
    const dotSeries = {
      name: "Значение",
      type: "scatter",
      data: values.map((value, index) => horizontal
        ? [value, names[index]]
        : [names[index], value]),
      symbolSize: 18,
      itemStyle: { color: palette[0], borderColor: "#fff", borderWidth: 2 },
      label: {
        show: true,
        formatter: ({ value }) => horizontal ? value[0] : value[1],
        position: horizontal ? "right" : "top",
        color: "#171717",
        fontWeight: 650
      },
      emphasis: { scale: 1.35 },
      z: 3
    };
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: horizontal ? 86 : 50, right: 42, top: 62, bottom: 46 },
      xAxis: horizontal
        ? { ...axis, type: "value", min: 0, max: 100 }
        : { ...axis, type: "category", data: names },
      yAxis: horizontal
        ? { ...axis, type: "category", inverse: true, data: names }
        : { ...axis, type: "value", min: 0, max: 100 },
      series: [stemSeries, dotSeries]
    };
  }

  function bumpChart(title) {
    const periods = ["2022", "2023", "2024", "2025", "2026"];
    const groups = [
      { name: "Альфа", ranks: [1, 1, 2, 3, 2], color: palette[0] },
      { name: "Бета", ranks: [3, 2, 1, 1, 1], color: palette[1] },
      { name: "Гамма", ranks: [2, 3, 4, 2, 3], color: palette[2] },
      { name: "Дельта", ranks: [5, 4, 3, 4, 5], color: palette[3] },
      { name: "Эпсилон", ranks: [4, 5, 5, 5, 4], color: palette[4] }
    ];
    return {
      ...base(title),
      tooltip: { trigger: "axis" },
      grid: { left: 54, right: 92, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "category", data: periods, boundaryGap: false },
      yAxis: {
        ...axis,
        type: "value",
        min: 1,
        max: 5,
        interval: 1,
        inverse: true,
        name: "Место"
      },
      series: groups.map((group) => ({
        name: group.name,
        type: "line",
        data: group.ranks,
        smooth: .28,
        symbol: "circle",
        symbolSize: 12,
        lineStyle: { width: 4, color: group.color },
        itemStyle: { color: group.color, borderColor: "#fff", borderWidth: 2 },
        endLabel: {
          show: true,
          formatter: group.name,
          color: group.color,
          fontWeight: 650,
          distance: 8
        },
        emphasis: { focus: "series", lineStyle: { width: 7 } }
      }))
    };
  }

  function spineChart(title) {
    const groups = ["Север", "Центр", "Юг", "Восток"];
    const left = [48, 36, 57, 42];
    const right = left.map((value) => 100 - value);
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => `${Math.abs(v)}%` },
      legend: { top: 40 },
      grid: { left: 76, right: 32, top: 82, bottom: 42 },
      xAxis: {
        ...axis,
        type: "value",
        min: -70,
        max: 70,
        axisLabel: { formatter: (v) => `${Math.abs(v)}%` }
      },
      yAxis: { ...axis, type: "category", data: groups },
      series: [
        { name: "Мужчины", type: "bar", stack: "spine", data: left.map((v) => -v), itemStyle: { color: palette[0] }, label: { show: true, position: "insideLeft", formatter: ({ value }) => `${Math.abs(value)}%` } },
        { name: "Женщины", type: "bar", stack: "spine", data: right, itemStyle: { color: palette[1] }, label: { show: true, position: "insideRight", formatter: "{c}%" } }
      ]
    };
  }

  function balanceFill(title) {
    const periods = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт"];
    const balance = [-18, -9, 5, 14, 22, 11, -4, -15, 3, 19];
    return {
      ...base(title),
      tooltip: { trigger: "axis", valueFormatter: (v) => `${v > 0 ? "+" : ""}${v} п.п.` },
      grid: { left: 54, right: 24, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "category", data: periods, boundaryGap: false },
      yAxis: { ...axis, type: "value", min: -25, max: 25, name: "Баланс, п.п." },
      visualMap: {
        show: false,
        dimension: 1,
        pieces: [
          { lte: 0, color: palette[1] },
          { gt: 0, color: palette[2] }
        ]
      },
      series: [{
        name: "Баланс",
        type: "line",
        data: balance,
        symbolSize: 7,
        lineStyle: { width: 3 },
        areaStyle: { opacity: .32 },
        markLine: { silent: true, symbol: "none", lineStyle: { color: "#626762", width: 2 }, data: [{ yAxis: 0 }] }
      }]
    };
  }

  function groupedBars(title, horizontal = false) {
    const groups = ["Север", "Центр", "Юг", "Восток"];
    const current = [72, 91, 64, 83];
    const previous = [61, 78, 69, 74];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { top: 40 },
      grid: { left: horizontal ? 76 : 50, right: 28, top: 82, bottom: 42 },
      xAxis: horizontal ? { ...axis, type: "value", min: 0 } : { ...axis, type: "category", data: groups },
      yAxis: horizontal ? { ...axis, type: "category", data: groups } : { ...axis, type: "value", min: 0 },
      series: [
        { name: "2025", type: "bar", data: previous, barMaxWidth: 28 },
        { name: "2026", type: "bar", data: current, barMaxWidth: 28 }
      ]
    };
  }

  function compositionMagnitude(title) {
    const groups = ["Проект A", "Проект B", "Проект C", "Проект D"];
    const parts = [
      { name: "Работы", data: [48, 35, 22, 43] },
      { name: "Материалы", data: [31, 27, 18, 26] },
      { name: "Прочее", data: [16, 10, 8, 14] }
    ];
    return {
      ...base(title),
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { top: 40 },
      grid: { left: 86, right: 32, top: 82, bottom: 40 },
      xAxis: { ...axis, type: "value", min: 0, name: "Общий объём" },
      yAxis: { ...axis, type: "category", data: groups },
      series: parts.map((part) => ({
        name: part.name,
        type: "bar",
        stack: "total",
        data: part.data,
        emphasis: { focus: "series" },
        label: { show: true, position: "inside", formatter: ({ value }) => value >= 14 ? value : "" }
      }))
    };
  }

  function pictogram(title) {
    const groups = [
      { name: "Команда A", value: 8, color: palette[0] },
      { name: "Команда B", value: 6, color: palette[1] },
      { name: "Команда C", value: 4, color: palette[2] }
    ];
    const data = groups.flatMap((group, row) =>
      Array.from({ length: group.value }, (_, index) => ({
        name: group.name,
        value: [index + 1, row, group.value],
        itemStyle: { color: group.color }
      }))
    );
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.name}: ${p.value[2]} человек` },
      grid: { left: 92, right: 30, top: 64, bottom: 38 },
      xAxis: { type: "value", min: .5, max: 10.5, show: false },
      yAxis: { ...axis, type: "category", inverse: true, data: groups.map((g) => g.name) },
      series: [{
        type: "scatter",
        symbol: "path://M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-5 10h10l2 8h-4v8H9v-8H5l2-8z",
        symbolSize: 28,
        data,
        emphasis: { scale: 1.3 }
      }]
    };
  }

  function bulletChart(title) {
    const names = ["Выручка", "Маржа", "Удержание", "Срок"];
    const actual = [78, 64, 86, 57];
    const target = [85, 70, 80, 65];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${names[p.value[1]]}<br>Факт: ${p.value[2]}<br>Цель: ${p.value[3]}` },
      grid: { left: 92, right: 34, top: 62, bottom: 40 },
      xAxis: { ...axis, type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } },
      yAxis: { ...axis, type: "category", data: names },
      series: [{
        type: "custom",
        data: actual.map((value, index) => [0, index, value, target[index]]),
        renderItem: (params, api) => {
          const row = api.value(1);
          const y = api.coord([0, row])[1];
          const x0 = api.coord([0, row])[0];
          const x60 = api.coord([60, row])[0];
          const x80 = api.coord([80, row])[0];
          const x100 = api.coord([100, row])[0];
          const xActual = api.coord([api.value(2), row])[0];
          const xTarget = api.coord([api.value(3), row])[0];
          return { type: "group", children: [
            { type: "rect", shape: { x: x0, y: y - 15, width: x60 - x0, height: 30 }, style: { fill: "#deded8" } },
            { type: "rect", shape: { x: x60, y: y - 15, width: x80 - x60, height: 30 }, style: { fill: "#c7c7c0" } },
            { type: "rect", shape: { x: x80, y: y - 15, width: x100 - x80, height: 30 }, style: { fill: "#adada5" } },
            { type: "rect", shape: { x: x0, y: y - 6, width: xActual - x0, height: 12 }, style: { fill: palette[0] } },
            { type: "line", shape: { x1: xTarget, y1: y - 12, x2: xTarget, y2: y + 12 }, style: { stroke: "#171717", lineWidth: 3 } }
          ]};
        }
      }]
    };
  }

  function parallelCoordinates(title) {
    const dimensions = ["Цена", "Качество", "Скорость", "Сервис", "Лояльность"];
    const observations = [
      { name: "Альфа", value: [72, 88, 61, 82, 77] },
      { name: "Бета", value: [44, 73, 91, 69, 84] },
      { name: "Гамма", value: [63, 58, 75, 93, 66] },
      { name: "Дельта", value: [86, 79, 54, 62, 71] },
      { name: "Эпсилон", value: [55, 66, 83, 76, 89] }
    ];
    return {
      ...base(title),
      tooltip: { trigger: "item" },
      legend: { top: 40 },
      parallel: { left: 58, right: 42, top: 92, bottom: 42, parallelAxisDefault: { type: "value", min: 0, max: 100, axisLine: axis.axisLine, axisLabel: axis.axisLabel, splitLine: axis.splitLine } },
      parallelAxis: dimensions.map((name, dim) => ({ dim, name })),
      series: observations.map((item, index) => ({
        name: item.name,
        type: "parallel",
        data: [item.value],
        lineStyle: { width: 2.5, opacity: .66, color: palette[index] },
        emphasis: { focus: "series", lineStyle: { width: 6, opacity: 1 } }
      }))
    };
  }

  function optionFor(chart) {
    const key = chart.img.toLowerCase();
    const title = chart.chartName;
    if (key === "bar-stacked-proportional.svg") return normalizedStacked(title);
    if (key === "violin.svg") return violin(title);
    if (key === "population-pyramis.svg") return populationPyramid(title);
    if (key === "dot-plot-strip-distribution.svg") return observationStrip(title);
    if (key === "dot-plot.svg") return dotRange(title);
    if (key === "barcode.svg") return barcode(title);
    if (key === "cumulative-curve.svg") return cumulativeCurve(title);
    if (key === "column-timeline.svg") return columnTimeline(title);
    if (key === "column-line-timeline.svg") return columnLineTimeline(title);
    if (key === "area.svg") return multiAreaTimeline(title);
    if (key === "scatterplot-line-timeline.svg") return connectedScatterTimeline(title);
    if (key === "stock-price.svg") return candlestick(title);
    if (key === "slope-timeline.svg") return slopeTimeline(title);
    if (key === "fan.svg") return fanChart(title);
    if (key === "priestley-timeline.svg") return priestleyTimeline(title);
    if (key === "circle-timeline.svg") return circleTimeline(title);
    if (key === "seismogram.svg") return seismogram(title);
    if (key === "symbol-proportional-ordered.svg") return orderedSymbols(title);
    if (key === "dot-plot-strip.svg") return rankingDotStrip(title);
    if (key === "slope-ranking.svg") return rankChange(title);
    if (key === "lollipop-h.svg") return lollipop(title, true);
    if (key === "lollipop-v.svg") return lollipop(title, false);
    if (key === "bump.svg") return bumpChart(title);
    if (key === "spine.svg") return spineChart(title);
    if (key === "line-surplur-defecit-fill.svg") return balanceFill(title);
    if (key === "column-grouped.svg") return groupedBars(title, false);
    if (key === "bar-grouped-magnitude.svg") return groupedBars(title, true);
    if (key === "bar-stacked-proportional-magnitude.svg") return compositionMagnitude(title);
    if (key === "isotope.svg") return pictogram(title);
    if (key === "lollipop-h-magnitude.svg") return lollipop(title, true);
    if (key === "lollipop-v-magnitude.svg") return lollipop(title, false);
    if (key === "bullet.svg") return bulletChart(title);
    if (key === "parallel coordinates.svg") return parallelCoordinates(title);
    if (key === "basic-choropleth.svg") return choroplethMap(title);
    if (key === "proportional-symbol.svg") return proportionalSymbolMap(title);
    if (key === "flow.svg") return flowMap(title);
    if (key === "contour.svg") return contourMap(title);
    if (key === "equalised-cartogram.svg") return equalisedCartogram(title);
    if (key === "scaled-cartogram-value.svg") return scaledCartogram(title);
    if (key === "dot-density.svg") return dotDensityMap(title);
    if (key === "heat-map.svg") return spatialHeatMap(title);
    if (key === "waterfall-flow.svg") return processWaterfall(title);
    if (key === "chord.svg") return chordDiagram(title);
    if (key === "voronoi.svg") return voronoi(title);
    if (key === "arc.svg") return semicircle(title);
    if (key === "gridplot.svg") return symbolGrid(title);
    if (key === "venn.svg") return venn(title);
    if (key === "waterfall.svg") return waterfall(title);
    if (key.includes("sankey")) return sankey(title);
    if (key.includes("network")) return network(title);
    if (key.includes("heatmap")) return heatmap(title, key.includes("calendar"));
    if (key.includes("calendar")) return heatmap(title, true);
    if (key.includes("scatterplot")) return scatter(title, key.includes("bubble"), key.includes("connected") || key.includes("line"));
    if (key.includes("bubble") || key.includes("symbol-proportional")) return scatter(title, true);
    if (key.includes("treemap")) return hierarchy(title, false);
    if (key.includes("sunburst")) return hierarchy(title, true);
    if (key.includes("pie") || key.includes("doughnut") || key.includes("arc")) return pie(title, key.includes("doughnut"), false);
    if (key.includes("radar") || key.includes("parallel")) return radar(title);
    if (key.includes("histogram")) return distribution(title, false);
    if (key.includes("boxplot")) return distribution(title, true);
    if (key.includes("bullet")) return gauge(title);
    if (key.includes("line") || key.includes("area") || key.includes("fan") || key.includes("timeline") || key.includes("bump") || key.includes("slope")) return line(title, key.includes("area"), key.includes("fan"));
    if (key.includes("stacked")) return bar(title, key.startsWith("bar"), key.includes("diverging"), true);
    if (key.includes("bar")) return bar(title, true, key.includes("diverging"), false);
    if (key.includes("column") || key.includes("lollipop") || key.includes("waterfall") || key.includes("spine") || key.includes("isotope") || key.includes("gridplot")) return bar(title, false, key.includes("waterfall"), false);
    if (chart.category === "flow") return sankey(title);
    if (chart.category === "part-whole") return pie(title, false, true);
    if (chart.category === "distribution") return distribution(title, false);
    if (chart.category === "correlation") return scatter(title, false, false);
    if (chart.category === "change-time") return line(title, false, false);
    return bar(title, chart.category === "ranking", chart.category === "deviation", false);
  }

  return { optionFor };
})();
