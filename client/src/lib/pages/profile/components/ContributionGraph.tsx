import Tooltip from '@uiw/react-tooltip';
import HeatMap from '@uiw/react-heat-map';

interface ContributionGraphProps {
  value: { date: string; count: number }[]; // Allow value to be null
}

const ContributionGraph = ({ value }: ContributionGraphProps) => {

  return (
    <HeatMap
      value={value}
      width={'700px'}
      height={'auto'}
      startDate={new Date('2024/01/01')}
      endDate={new Date('2024/12/31')}
      rectRender={(props, data) => {
        return (
          <Tooltip placement="top" content={`count: ${data.count || 0}`}>
            <rect {...props} />
          </Tooltip>
        );
      }}
    />
  );
};

export default ContributionGraph;
