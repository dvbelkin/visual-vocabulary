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
    if (key.includes("histogram") || key.includes("barcode") || key.includes("violin") || key.includes("cumulative")) return distribution(title, false);
    if (key.includes("boxplot") || key.includes("dot-plot")) return distribution(title, true);
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
