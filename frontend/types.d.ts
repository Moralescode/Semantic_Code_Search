declare module 'react-plotly.js' {
  import { Component } from 'react';
  import Plotly from 'plotly.js';

  export interface PlotProps {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: Plotly.Figure) => void;
    onUpdate?: (figure: Plotly.Figure) => void;
    onPurge?: () => void;
    onError?: (err: Error) => void;
  }

  class Plot extends Component<PlotProps> {}
  export default Plot;
}

declare module 'plotly.js' {
  const plotly: any;
  export default plotly;
}

