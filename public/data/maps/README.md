# Cartography datasets

The files in this directory are stored locally so the chart routes do not depend
on third-party data servers at runtime.

## US county unemployment

- `us-counties-albers-10m.json`
- `us-county-unemployment-2016.csv`
- Subject: unemployment rate by US county, August 2016.
- Data source: US Bureau of Labor Statistics, Local Area Unemployment
  Statistics.
- Geometry: TopoJSON US Atlas, derived from 2017 US Census Bureau shapefiles.
- Retrieved from the file attachments of the Observable D3 Choropleth example:
  <https://observablehq.com/@d3/choropleth>

## US adult obesity

- `us-states-albers-10m.json`
- `us-adult-obesity-2008-2018.csv`
- Subject: percentage of adults with a self-reported body mass index of 30 or
  higher, 2008 and 2018.
- Data source: US Centers for Disease Control and Prevention.
- Retrieved from the file attachments of the Observable D3 Non-contiguous
  Cartogram example:
  <https://observablehq.com/@d3/non-contiguous-cartogram>

The example code was adapted rather than copied verbatim. Observable notebooks
are published under the ISC license unless otherwise stated. The original
public-agency sources retain their own terms.
