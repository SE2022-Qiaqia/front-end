<script setup lang="tsx">
import { NTable, NEmpty, DataTableColumn, NDataTable, DataTableColumns, NP, NH6, NText, NPopover } from 'naive-ui';
import { DayOfWeek, dayName } from '@/api/resp';
import { HourSchedules, DaySchedules } from '.';

const props = defineProps<{
  data: HourSchedules,
  emptyDescription?: string,
  hoursKey: number[]
}>();

const daysKey: DayOfWeek[] = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];

function createColumn(day: DayOfWeek): DataTableColumn<DaySchedules> {
  return {
    title: dayName(day).toLocaleUpperCase(),
    key: day,
    width: '12.5%',
    rowSpan: (row, rowIndex) => {
      const course = row[day];
      if (!course || !course.length) return 1;
      return course[0].endHoursId - course[0].startHoursId + 1;
    },
    render(row) {
      const courses = row[day];
      if (!courses || !courses.length) return null;
      const course = courses[0];

      const slots = {
        trigger: () => (<div>
          <NH6 >{course.courseCommon.name} ({course.location})</NH6>
          <NP><NText depth="2">{`第${course.startWeekId}~${course.endWeekId}周`}</NText></NP>
        </div>)
      };

      return (
        // <NThing title={course[0].courseCommon.name} />
        <NPopover v-slots={slots}>
          <NH6 >{course.courseCommon.name} (课程号: {course.courseCommon.id})</NH6>
          <NP>
            <NText depth="3" italic>{`开课学院：${course.courseCommon.college.name}`}</NText>
          </NP>
          <NP>{`${course.teacher.realName} (${course.teacher.college.name})`}</NP>
          <NP>{`第${course.startWeekId}~${course.endWeekId}周`}</NP>
          <NP>{`第${course.startHoursId}~${course.endHoursId}节`}</NP>
          <NP>{`地点：${course.location}`}</NP>
          <NP>{`学分：${course.courseCommon.credits.toFixed(1)} 分`}</NP>
        </NPopover>
      );
    }
  };
}
const columns: DataTableColumns<DaySchedules> = daysKey.map(createColumn);
columns.unshift({
  title: '#',
  key: 'time',
  width: '12.5%',
  render(row, rowIndex) {
    return ('' + (rowIndex + props.hoursKey[0]));
  },
});

</script>

<template>
  <n-data-table :columns="columns" :data="data" :single-line="false">
    <template #empty>
      <n-empty :description="emptyDescription" />
    </template>
  </n-data-table>
  <n-table v-if="false">
    <!-- 留着后期可能用于调试 -->
    <thead>
      <tr>
        <th> # </th>
        <th>周日</th>
        <th>周一</th>
        <th>周二</th>
        <th>周三</th>
        <th>周四</th>
        <th>周五</th>
        <th>周六</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="hour in hoursKey">
        <td>{{ hour }}</td>
        <td v-for="day in daysKey">
          <template v-if="data[hour] && data[hour][day] && data[hour][day].length">
            {{ data[hour][day][0].courseCommon.name }} ({{
                data[hour][day][0].courseCommon.college.name
            }})
          </template>
        </td>
      </tr>
    </tbody>
  </n-table>
</template>