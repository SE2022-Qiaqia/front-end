<script setup lang="tsx">
import { computed } from '@vue/reactivity';
import {
  NSpace, NSwitch, NPagination, NCollapse, NCollapseItem, NTable, NEmpty,
  NCard, DataTableColumn, NThing, NDataTable, DataTableColumns, NP, NH6, NText, NPopover
} from 'naive-ui';
import { ref } from 'vue';
import { CourseScheduleWithCourseSpecific, dayName, DayOfWeek, Role } from '../api/resp';
import { injectStore } from '../store';

const store = injectStore();

const props = defineProps<{
  schedules: CourseScheduleWithCourseSpecific[];
}>();

const listMode = ref(true);
const allWeek = ref(true);
const noRedundantHours = ref(true);
const week = ref(1);

type DaySchedules = {
  [key in DayOfWeek]: CourseScheduleWithCourseSpecific[];
};
type HourSchedules = DaySchedules[];
function _emptyDaySchedules(): DaySchedules {
  return {
    [DayOfWeek.Monday]: [],
    [DayOfWeek.Tuesday]: [],
    [DayOfWeek.Wednesday]: [],
    [DayOfWeek.Thursday]: [],
    [DayOfWeek.Friday]: [],
    [DayOfWeek.Saturday]: [],
    [DayOfWeek.Sunday]: [],
  };
}

const noSchedulesDescription = computed(() => store.state.user?.role === Role.Admin ? '您为管理员，不需要上课' : '您没有课要上哦');
const hoursKey = ref<number[]>([]);
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
    return ('' + (rowIndex + hoursKey.value[0]));
  },
});

const filtered = computed(() => props.schedules
  .filter(x => (allWeek.value || (x.startWeekId <= week.value && x.endWeekId >= week.value)) // 过滤周次
  )
  .sort((a, b) => {
    if (a.startWeekId !== b.startWeekId) {
      return a.startWeekId - b.startWeekId;
    }
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }
    return a.startHoursId - b.startHoursId;
  }));

// 预处理列表模式的数据
const finalSchedulesForList = computed<DaySchedules>(() =>
  filtered.value.reduce((pre: DaySchedules, cur) => {
    pre[cur.dayOfWeek] = pre[cur.dayOfWeek] || [];
    pre[cur.dayOfWeek].push(cur);
    return pre;
  }, _emptyDaySchedules()));
// 预处理表格模式的数据(默认从1~13节的课都显示)
const finalSchedulesForTable = computed<HourSchedules>(() => {
  let max = 13;
  let maxActual = 0;
  let min = 1;
  const tableSchedules = filtered.value.reduce((pre: HourSchedules, cur) => {
    pre[cur.startHoursId] = pre[cur.startHoursId] || {};
    pre[cur.startHoursId][cur.dayOfWeek] = pre[cur.startHoursId][cur.dayOfWeek] || [];
    pre[cur.startHoursId][cur.dayOfWeek].push(cur);
    if (cur.startHoursId < min) {
      min = cur.startHoursId;
    }
    if (cur.endHoursId > maxActual) {
      maxActual = cur.endHoursId;
    }
    return pre;
  }, Array.from({ length: 25 }).map(() => _emptyDaySchedules())); // 这里用`25`是为了方便和数据里课程节数从1开始相适应
  max = noRedundantHours.value ? maxActual : max;
  tableSchedules.splice(max + 1); // 去除无效的课时
  tableSchedules.splice(0, 1); // 去除第0节课（是之前为方便处理引入的）

  hoursKey.value = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return tableSchedules;
});

</script>

<template>
  <n-space vertical style="padding-bottom: 20px;">

    <n-space justify="end">
      <n-switch :disabled="listMode" v-model:value="noRedundantHours">
        <template #checked>精简</template>
        <template #unchecked>完整</template>
      </n-switch>
      <n-switch v-model:value="listMode">
        <template #checked>列表模式</template>
        <template #unchecked>表格模式</template>
      </n-switch>
      <n-switch v-model:value="allWeek">
        <template #checked>所有周次</template>
        <template #unchecked>指定周次</template>
      </n-switch>
      <n-pagination v-model:page="week" :disabled="allWeek" :page-count="20" />
    </n-space>


    <template v-if="schedules.length">

      <template v-if="listMode">
        <n-collapse :default-expanded-names="Object.keys(finalSchedulesForList)">
          <template v-for="day of finalSchedulesForList">
            <n-collapse-item v-if="day.length" :title="dayName(day[0].dayOfWeek)" :name="'' + day[0].dayOfWeek">
              <n-table :bordered="true">
                <thead>
                  <tr>
                    <th>课程名</th>
                    <th>授课老师</th>
                    <th>授课地点</th>
                    <th>授课时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in day">
                    <td>{{ s.courseCommon.name }} ({{ s.courseCommon.college.name }})</td>
                    <td>{{ s.teacher.realName }} ({{ s.teacher.college.name }})</td>
                    <td>{{ s.location }}</td>
                    <td>
                      <template v-if="s.startWeekId"> 第{{ s.startWeekId }}~{{ s.endWeekId }}周， </template>
                      {{ dayName(s.dayOfWeek) }}
                      <template v-if="s.startHoursId">
                        ，第{{ s.startHoursId }}~{{ s.endHoursId }}节
                      </template>
                    </td>
                  </tr>
                </tbody>
              </n-table>
            </n-collapse-item>
          </template>
        </n-collapse>
      </template>
      <template v-else>
        <n-data-table :columns="columns" :data="finalSchedulesForTable" :single-line="false">
          <template #empty>
            <n-empty :description="noSchedulesDescription"></n-empty>
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
                <template
                  v-if="finalSchedulesForTable[hour] && finalSchedulesForTable[hour][day] && finalSchedulesForTable[hour][day].length">
                  {{ finalSchedulesForTable[hour][day][0].courseCommon.name }} ({{
                      finalSchedulesForTable[hour][day][0].courseCommon.college.name
                  }})
                </template>
              </td>
            </tr>
          </tbody>
        </n-table>
      </template>

    </template>
    <template v-else>
      <n-card>
        <n-empty size="large" :description="noSchedulesDescription">
        </n-empty>
      </n-card>
    </template>

  </n-space>
</template>