import React, { useState } from 'react';

export default ({ hoveredLine, scales }) => {
  const { xScale, yScale } = scales;
  const styles = {
    left: `${xScale(hoveredLine) - 30}px`
    // top: `${yScale(hoveredLine)}px`
  };

  return (
    <div className="Tooltip" style={styles}>
      <table>
        <thead>
          <tr>
            <th colSpan="2">{hoveredLine}</th>
          </tr>
        </thead>
        {/* <tbody>
          <tr>
            <td colSpan="1">Statistic</td>
            <td colSpan="1">{hoveredLine.statistic}</td>
          </tr>
          <tr>
            <td colSpan="1">logFC</td>
            <td colSpan="1">{hoveredLine.logfc}</td>
          </tr>
        </tbody> */}
      </table>
    </div>
  );
};

// const tooltipContext = React.createContext();

// function useTooltip() {
//   const [tooltip, setTooltip] = useState(false);

//   return { tooltip, setTooltip };
// }

// export { useTooltip, tooltipContext };
