<template>
  <n-grid :cols="12" style="margin-bottom: 20px;">

    <n-grid-item :offset="1" :span="10">

      <n-spin :show="querying">

        <n-space vertical align="stretch" size="large">
          <n-form :model="queryModel" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
            <n-form-item label="课程: ">
              <n-input v-model:value="queryModel.name" placeholder="请输入课程名" @keydown.enter="queryCourses(true)" />
            </n-form-item>
            <n-form-item label="学院: ">
              <n-select v-model:value="queryModel.collegesId" placeholder="请选择学院" :options="collegesOptions" multiple />
            </n-form-item>
            <n-form-item label="教师: ">
              <n-input v-model:value="queryModel.teacherName" placeholder="请输入教师名字"
                @keydown.enter="queryCourses(true)" />
            </n-form-item>
            <n-form-item label="学期: ">
              <n-select v-model:value="queryModel.semester" placeholder="请选择学期" :options="semestersOptions" />
            </n-form-item>
            <n-form-item label="余量: ">
              <n-checkbox v-model:checked="queryModel.onlyLeftQuota" label="仅看有余量" />
            </n-form-item>
            <div style="display: flex; justify-content: flex-end">
              <n-space>
                <n-button round type="primary" @click="queryCourses(true)">
                  查询
                </n-button>
                <n-button round ghost @click="resetQuery()">
                  重置
                </n-button>
              </n-space>
            </div>
          </n-form>

          <n-collapse>
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

              <template v-if="courseCommon.courseSpecifics.length <= 0">
                <n-empty description="在该筛选条件下没有找到符合的课头哦~">
                </n-empty>
              </template>
              <template v-else>
                <n-table :bordered="true">
                  <thead>
                    <tr>
                      <th>课程名</th>
                      <th>授课老师</th>
                      <th>授课地点</th>
                      <th>授课时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="specific in courseCommon.courseSpecifics" key="id">
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
                      <td>
                        <template v-if="store.state.user?.role == Role.Admin">
                          <n-space>
                            <n-button ghost type="primary">
                              强选
                            </n-button>
                            <n-button ghost type="error">
                              强撤
                            </n-button>
                          </n-space>
                        </template>
                        <template v-if="store.state.user?.role == Role.Student">
                          <n-space>
                            <n-button ghost v-if="store.state.schedules.findIndex(x => x.id === specific.id) < 0"
                              type="primary">
                              选课
                            </n-button>
                            <n-button ghost v-else type="error">
                              撤课
                            </n-button>
                          </n-space>
                        </template>
                        <template v-if="store.state.user?.role == Role.Teacher">
                          <n-space>
                            <n-button ghost v-if="store.state.schedules.findIndex(x => x.id === specific.id) < 0"
                              type="primary">
                              查看详情
                            </n-button>
                          </n-space>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </template>

            </n-collapse-item>
          </n-collapse>

        </n-space>

      </n-spin>

    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import {
  NSpace, NGrid, NGridItem, NForm, NFormItem,
  NInput, NSelect, SelectOption, NCheckbox, NButton, NSpin,
  NCollapse, NCollapseItem, NEmpty, NTable, NText
} from 'naive-ui';
import { onMounted, ref, watch, watchEffect } from 'vue';
import { api } from '../api';
import { College, CourseCommonWithSpecifics, Semester, dayName, Role } from '../api/resp';
import { QueryCoursesRequest } from '../api/req';
import { injectStore } from '../store';

const store = injectStore();
const queryModel = ref<QueryCoursesRequest>({
  name: '',
  collegesId: [],
  teacherName: '',
  onlyLeftQuota: true,
  semester: 0,
  page: 1,
  size: 10
});

const querying = ref(false);

const colleges = ref<College[]>([]);
const collegesOptions = ref<SelectOption[]>();
watch(() => colleges.value, () => {
  collegesOptions.value = colleges.value.map(c => ({
    value: c.id,
    label: c.name
  }));
});

const semesters = ref<Semester[]>([]);
const currentSemesterId = ref(0);
const semestersOptions = ref<SelectOption[]>();
watchEffect(() => {
  semestersOptions.value = semesters.value.map(s => ({
    value: s.id,
    label: `${s.year}级-第${s.term}学期${s.id === currentSemesterId.value ? '(本学期)' : ''}`
  }));
});

onMounted(() => {
  api.fetchColleges()
    .then(res => colleges.value = res);
  api.fetchSemesters()
    .then(res => semesters.value = res);
  api.fetchCurrentSemester()
    .then(res => {
      currentSemesterId.value = res.id;
      queryModel.value.semester = res.id;
    });
});

const courses = ref<CourseCommonWithSpecifics[]>([]);
const totalPage = ref(0);

async function queryCourses(resetPage: boolean = false) {
  querying.value = true;
  if (resetPage = true) {
    queryModel.value.page = 1;
    courses.value.splice(0);
  }
  const coursesPage = await api.queryCourses(queryModel.value);
  totalPage.value = coursesPage.total / coursesPage.pageSize;
  courses.value.push(...coursesPage.contents);

  querying.value = false;
}

function resetQuery() {
  queryModel.value = {
    name: '',
    collegesId: [],
    teacherName: '',
    onlyLeftQuota: true,
    semester: semesters.value[0].id,
    page: 1,
    size: 10
  };
}
</script>
