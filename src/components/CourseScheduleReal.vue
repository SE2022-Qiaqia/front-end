<script setup lang="tsx">
import { NSpace, NSwitch, NPagination, NCollapse, NCollapseItem, NTable, NEmpty, NCard } from 'naive-ui';
import { ref, watchEffect } from 'vue';
import { CourseScheduleWithCourseSpecific, dayName, DayOfWeek, Role } from '../api/resp';
import { injectStore } from '../store';

const store = injectStore();

const props = defineProps<{
  schedules: CourseScheduleWithCourseSpecific[];
}>();

const listMode = ref(true);
const allWeek = ref(true);
const week = ref(1);
type DayAndSchedule = {
  [key in DayOfWeek]: CourseScheduleWithCourseSpecific[];
};
function _empty(): DayAndSchedule {
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
const finalSchedules = ref<DayAndSchedule>(_empty());

watchEffect(() => {
  finalSchedules.value
    = props.schedules
      .filter(x =>
        (allWeek.value || (x.startWeekId <= week.value && x.endWeekId >= week.value)) // 过滤周次
      )
      .sort((a, b) => {
        if (a.startWeekId !== b.startWeekId) {
          return a.startWeekId - b.startWeekId;
        }
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return a.startHoursId - b.startHoursId;
      })
      .reduce((pre: DayAndSchedule, cur) => {
        pre[cur.dayOfWeek] = pre[cur.dayOfWeek] || [];
        pre[cur.dayOfWeek].push(cur);
        return pre;
      }, _empty());
});

</script>

<template>
  <n-space vertical>

    <n-space justify="end">
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
        <n-collapse :default-expanded-names="Object.keys(finalSchedules)">
          <template v-for="day of finalSchedules">
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
                    <template v-if="s.startWeekId">
                      第{{ s.startWeekId }}~{{ s.endWeekId }}周，
                    </template>
                    {{ dayName(s.dayOfWeek) }}
                    <template v-if="s.startHoursId">
                      ，第{{ s.startHoursId }}~{{ s.endHoursId }}节
                    </template>
                  </tr>
                </tbody>
              </n-table>
            </n-collapse-item>
          </template>
        </n-collapse>
      </template>
      <template v-else>
        <!-- TODO -->
        <span>表格模式正在施工哦~</span>
      </template>

    </template>
    <template v-else>
      <n-card>
        <n-empty size="large" :description="store.state.user?.role === Role.Admin ? '您为管理员，不需要上课' : '您没有课要上哦'">
        </n-empty>
      </n-card>
    </template>

  </n-space>
</template>