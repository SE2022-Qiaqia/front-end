<script setup lang="ts">
import { NCollapse, NCollapseItem, NTable } from 'naive-ui';
import { dayName } from '@/api/resp';
import { DaySchedules } from '.';

defineProps<{
  data: DaySchedules
}>();
</script>

<template>
  <n-collapse :default-expanded-names="Object.keys(data)">
    <template v-for="day of data">
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