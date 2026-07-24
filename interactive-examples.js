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
      [0,0,18,"Запуск"], [1,1,32,"Релиз"], [2,0,12,"Обновление"], [3,2,46,"Кампания"],
      [4,1,22,"Партнёрство"], [5,2,35,"Конференция"], [6,0,16,"Обновление"], [7,1,54,"Крупный релиз"]
    ];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${months[p.value[0]]}: ${p.value[3]}<br>Масштаб: ${p.value[2]}` },
      grid: { left: 88, right: 24, top: 62, bottom: 42 },
      xAxis: { ...axis, type: "category", data: months },
      yAxis: { ...axis, type: "category", data: ["Продукт","Бизнес","Коммуникации"] },
      series: [{ type: "scatter", data: events, symbolSize: (v) => 10 + Math.sqrt(v[2]) * 4, itemStyle: { opacity: .72 }, emphasis: { scale: 1.35 } }]
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

  function spatial(title, flow = false) {
    const cities = [[12,62,38,"Север"],[30,42,58,"Центр"],[56,55,25,"Восток"],[72,25,46,"Юг"],[43,18,31,"Запад"]];
    return {
      ...base(title),
      tooltip: { formatter: (p) => `${p.value[3]}: ${p.value[2]}` },
      grid: { left: 28, right: 28, top: 58, bottom: 24 },
      xAxis: { min: 0, max: 85, show: false },
      yAxis: { min: 0, max: 75, show: false },
      series: flow
        ? [
            { type: "lines", coordinateSystem: "cartesian2d", effect: { show: true, symbol: "arrow", symbolSize: 7 }, lineStyle: { width: 2, curveness: 0.2 }, data: cities.slice(1).map((c) => ({ coords: [[30,42],[c[0],c[1]]] })) },
            { type: "scatter", data: cities, symbolSize: (v) => 10 + v[2] / 3, label: { show: true, formatter: (p) => p.value[3], position: "top" } }
          ]
        : [{ type: "scatter", data: cities, symbolSize: (v) => 10 + v[2] / 2, label: { show: true, formatter: (p) => p.value[3], position: "top" }, emphasis: { focus: "series", scale: 1.3 } }]
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
    if (key === "column-line-timeline.svg") return columnLineTimeline(title);
    if (key === "stock-price.svg") return candlestick(title);
    if (key === "slope-timeline.svg") return slopeTimeline(title);
    if (key === "fan.svg") return fanChart(title);
    if (key === "priestley-timeline.svg") return priestleyTimeline(title);
    if (key === "circle-timeline.svg") return circleTimeline(title);
    if (key === "seismogram.svg") return seismogram(title);
    if (key === "voronoi.svg") return voronoi(title);
    if (key === "arc.svg") return semicircle(title);
    if (key === "gridplot.svg") return symbolGrid(title);
    if (key === "venn.svg") return venn(title);
    if (key === "waterfall.svg") return waterfall(title);
    if (key.includes("sankey")) return sankey(title);
    if (key.includes("network") || key.includes("chord")) return network(title);
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
    if (key.includes("choropleth") || key.includes("cartogram") || key.includes("density") || key.includes("contour") || key.includes("heat-map")) return spatial(title, false);
    if (chart.category === "spatial" || key === "flow.svg") return spatial(title, key.includes("flow"));
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
