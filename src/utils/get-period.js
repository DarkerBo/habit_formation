export function getPeriod() {
  const currentHour = new Date().getHours();

  const timePeriod = [
    { hour: 11, label: '晨间', value: '1' },
    { hour: 18, label: '午间', value: '2' },
    { hour: 24, label: '夜间', value: '3' },
  ];
  return timePeriod.find(item => currentHour < item.hour);
}
