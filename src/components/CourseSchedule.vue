<script setup lang="tsx">
import { NDataTable, NThing } from 'naive-ui';
import type { DataTableColumns, DataTableColumn } from 'naive-ui';
import { Course, Day, maxCoursePeriodsCount } from '../models';
import { courses } from '../models/mock';

type DayAndCourses = { [key in Day]?: Course };

function createColumn(day: Day): DataTableColumn<DayAndCourses> {
  return {
    title: day.toLocaleUpperCase(),
    key: day,
    width: '14.2%',
    rowSpan: (row, rowIndex) => {
      const course = row[day];
      if (!course) return 1;
      return course.duration;
    },
    render(row) {
      const course = row[day];
      if (!course) return null;
      return (
        <NThing title={course.name} />
      );
    }
  };
}

const days: Day[] = [Day.Sun, Day.Mon, Day.Tue, Day.Wed, Day.Thu, Day.Fri, Day.Sat];
const data: DayAndCourses[] = Array.from({ length: maxCoursePeriodsCount }, () => {
  return {
    [Day.Sun]: {} as Course,
    [Day.Mon]: {} as Course,
    [Day.Tue]: {} as Course,
    [Day.Wed]: {} as Course,
    [Day.Thu]: {} as Course,
    [Day.Fri]: {} as Course,
    [Day.Sat]: {} as Course,
  };
});
courses.forEach(c => {
  data[c.start - 1] = data[c.start - 1] || {};
  data[c.start - 1][days[c.dayOfWeek]] = c;
});

const columns: DataTableColumns = days.map(createColumn);

</script>

<template>
  <n-data-table :columns="columns" :data="data" :single-line="false" />
</template>