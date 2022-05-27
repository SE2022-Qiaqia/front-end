<script setup lang="ts">
import {
  NSpace, NButton, NCollapse, NCollapseItem, NEmpty, NTable, NText, NIcon, NDivider
} from 'naive-ui';
import { Add24Filled, Edit16Regular } from '@vicons/fluent';
import {
  CourseCommonWithSpecifics, dayName, Role,
  CourseSpecificWithoutCommon
} from '@/api/resp';


defineProps<{
  courses: CourseCommonWithSpecifics[],
  currentUserRole: Role,
  isSelectedValidator: (course: CourseSpecificWithoutCommon) => boolean,
}>();

const emits = defineEmits<{
  (e: 'select', courseSpecific: CourseSpecificWithoutCommon, courseCommon: CourseCommonWithSpecifics): void
  (e: 'withdraw', courseSpecific: CourseSpecificWithoutCommon, courseCommon: CourseCommonWithSpecifics): void
  (e: 'editCommon', courseCommon: CourseCommonWithSpecifics): void
}>();

const confirmSelectCourse
  = (specific: CourseSpecificWithoutCommon, courseCommon: CourseCommonWithSpecifics) => emits('select', specific, courseCommon);

const confirmWithdrawCourse
  = (specific: CourseSpecificWithoutCommon, courseCommon: CourseCommonWithSpecifics) => emits('withdraw', specific, courseCommon);

const enterEditCourseCommon
  = (courseCommon: CourseCommonWithSpecifics) => emits('editCommon', courseCommon);
</script>

<template>
  <n-empty v-if="!courses.length" />
  <n-collapse v-else>
    <n-collapse-item v-for="courseCommon in courses" key="id">
      <template #header>
        <n-text :depth="courseCommon.courseSpecifics.length > 0 ? undefined : '3'">
          {{ courseCommon.name }} (课程号：{{ courseCommon.id }})
        </n-text>
      </template>
      <template #header-extra>
        <n-text :depth="courseCommon.courseSpecifics.length > 0 ? undefined : '3'">
          {{ courseCommon.college.name }} {{ courseCommon.credits.toFixed(1) }} 分
        </n-text>
      </template>

      <template v-if="currentUserRole !== Role.Admin && courseCommon.courseSpecifics.length <= 0">
        <n-empty description="在该筛选条件下没有找到符合的课头哦~">
        </n-empty>
      </template>
      <template v-else>
        <n-table :bordered="true">
          <thead>
            <tr>
              <th>课头号</th>
              <th>课程名</th>
              <th>授课老师</th>
              <th>授课地点</th>
              <th>授课时间</th>
              <th>人数(总额/已选/余量)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="specific in courseCommon.courseSpecifics" key="id">
              <td>{{ specific.id }}</td>
              <td>{{ courseCommon.name }}</td>
              <td>{{ specific.teacher.realName }}({{ specific.teacher.college.name }})</td>
              <td>{{ specific.location }}</td>
              <td>
                <p v-for="schedule in specific.courseSchedules">
                  <template v-if="schedule.startWeekId">
                    第{{ schedule.startWeekId }}~{{ schedule.endWeekId }}周，
                  </template>
                  {{ dayName(schedule.dayOfWeek) }}
                  <template v-if="schedule.startHoursId">
                    ，第{{ schedule.startHoursId }}~{{ schedule.endHoursId }}节
                  </template>
                </p>
              </td>
              <td>{{ specific.quota }}/{{ specific.quotaUsed }}/{{ specific.quota - specific.quotaUsed }}</td>
              <td>
                <template v-if="currentUserRole == Role.Admin">
                  <n-space>
                    <n-button ghost type="primary" @click="confirmSelectCourse(specific, courseCommon)">
                      强选
                    </n-button>
                    <n-button ghost type="error" @click="confirmWithdrawCourse(specific, courseCommon)">
                      强撤
                    </n-button>
                    <n-divider vertical />
                    <n-button ghost type="info">
                      <template #icon>
                        <n-icon>
                          <Edit16Regular />
                        </n-icon>
                        <!-- 编辑课程 -->
                      </template>
                    </n-button>
                  </n-space>
                </template>
                <template v-if="currentUserRole == Role.Student">
                  <n-space>
                    <n-button ghost v-if="isSelectedValidator(specific)" type="primary"
                      @click="confirmSelectCourse(specific, courseCommon)">
                      选课
                    </n-button>
                    <n-button ghost v-else type="error" @click="confirmWithdrawCourse(specific, courseCommon)">
                      撤课
                    </n-button>
                  </n-space>
                </template>
                <template v-if="currentUserRole == Role.Teacher">
                  <n-space>
                    <n-button ghost v-if="isSelectedValidator(specific)" type="primary">
                      查看详情
                      <!-- TODO -->
                    </n-button>
                  </n-space>
                </template>
              </td>
            </tr>
            <tr v-if="currentUserRole === Role.Admin">
              <td colspan="100">
                <n-space justify="center">
                  <n-button type="primary" round ghost>
                    <template #icon>
                      <n-icon>
                        <Add24Filled />
                      </n-icon>
                    </template>
                    开设课头
                  </n-button>
                  <n-button type="info" round ghost @click="enterEditCourseCommon(courseCommon)">
                    <template #icon>
                      <n-icon>
                        <Edit16Regular />
                      </n-icon>
                    </template>
                    编辑课程信息
                  </n-button>
                </n-space>
              </td>
            </tr>
          </tbody>
        </n-table>
      </template>

    </n-collapse-item>
  </n-collapse>

</template>