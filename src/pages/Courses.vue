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
            <n-space justify="space-between">
              <n-space>
                <n-button round ghost text type="primary" @click="enterNewCourseCommon">
                  <template #icon>
                    <n-icon>
                      <Add24Filled />
                    </n-icon>
                  </template>
                  新增课程
                </n-button>
              </n-space>
              <n-space>
                <n-button round type="primary" @click="queryCourses(true)">
                  查询
                </n-button>
                <n-button round ghost @click="resetQuery()">
                  重置
                </n-button>
              </n-space>
            </n-space>
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
                            <n-button ghost v-if="schedules.findIndex(x => x.id === specific.id) < 0" type="primary"
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
                            <n-button ghost v-if="schedules.findIndex(x => x.id === specific.id) < 0" type="primary">
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

          <n-space vertical align="center">
            <n-button style="width: 100%" v-if="courses.length" text @click="queryNextPageCourses">
              {{ queryModel.page < totalPage ? '加载更多' : '没有了~' }} </n-button>
          </n-space>
        </n-space>

      </n-spin>

      <!-- 对话框 —— 选课/撤课 -->
      <n-modal v-model:show="courseSelecting">
        <n-card style="width: 500px" title="选课/撤课" :bordered="false" size="huge" role="dialog" aria-modal="true">
          <n-spin :show="courseSelectingModel.operating">
            <n-space vertical>
              <n-space>
                <n-form-item label="学生ID:" label-placement="left">
                  <n-input v-model:value="courseSelectingModel.studentId" placeholder="请输入学号, 回车查询" clearable
                    :disabled="currentUserRole !== Role.Admin" @keydown.enter="queryStudent" />
                </n-form-item>
                <n-button v-if="courseSelectingModel.operation === Operation.Select" type="primary"
                  :disabled="courseSelectingModel.student?.role !== Role.Student" @click="selectOrWithdraw">选课
                </n-button>
                <n-button v-else-if="courseSelectingModel.operation === Operation.Withdraw" type="error"
                  :disabled="courseSelectingModel.student?.role !== Role.Student" @click="selectOrWithdraw">撤课
                </n-button>
                <n-button v-else-if="courseSelectingModel.operation === Operation.Open" type="warning"
                  :disabled="courseSelectingModel.student?.role !== Role.Teacher">开课</n-button>
              </n-space>

              <user-brief v-if="courseSelectingModel.student" :user="courseSelectingModel.student" />
              <n-text v-else>未找到该用户</n-text>

              <course-brief :course-common="courseSelectingModel.courseCommon"
                :course-specific="courseSelectingModel.course" />
            </n-space>
          </n-spin>
        </n-card>
      </n-modal>

      <!-- 对话框 —— 添加/编辑课程 -->
      <n-modal v-model:show="isEditingCourseCommonModel">
        <n-card style="width: auto" :title="courseCommonOperation === Operation.New ? '新增课程' : '编辑课程'" :bordered="false"
          size="huge" role="dialog" aria-modal="true">
          <n-space>

            <!-- 课程信息表单 -->
            <n-form :model="courseCommonModel" :rules="courseCommonModelRules" label-placement="left" label-width="auto"
              require-mark-placement="right-hanging" :disabled="courseCommonModelOperating">
              <n-form-item label="课程名:" path="name">
                <n-input v-model:value="courseCommonModel.name" placeholder="课程名" clearable />
              </n-form-item>
              <n-form-item label="学院: " path="collegeId">
                <n-select v-model:value="courseCommonModel.collegeId" placeholder="请选择学院" :options="collegesOptions" />
              </n-form-item>
              <n-form-item label="学分:" path="credits">
                <n-input-number v-model:value="courseCommonModel.credits" :min="0.5" placeholder="请输入学分" clearable>
                  <template #suffix>
                    分
                  </template>
                </n-input-number>
              </n-form-item>
              <n-form-item label="学时:" path="credits">
                <n-input-number v-model:value="courseCommonModel.hours" :min="10" placeholder="请输入学时" clearable>
                  <template #suffix>
                    课时
                  </template>
                </n-input-number>
              </n-form-item>
              <n-space justify="end">
                <n-button round ghost :type="courseCommonOperation === Operation.New ? 'primary' : 'info'"
                  @click="confirmCourseCommonOperation" :loading="courseCommonModelOperating">
                  <template #icon>
                    <n-icon>
                      <Add24Filled v-if="courseCommonOperation === Operation.New" />
                      <Edit16Regular v-if="courseCommonOperation === Operation.EditCommon" />
                    </n-icon>
                  </template>
                  确认
                </n-button>
              </n-space>
            </n-form>

            <!-- 预览课程信息 -->
            <course-brief v-if="editingCourseCommon" :course-common="editingCourseCommon" />
          </n-space>

        </n-card>
      </n-modal>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import {
  NSpace, NGrid, NGridItem, NForm, NFormItem,
  NInput, NInputNumber, NSelect, SelectOption, NCheckbox, NButton, NSpin,
  NCollapse, NCollapseItem, NEmpty, NTable, NText, NModal,
  NCard, NIcon, NDivider, FormRules,
  useMessage, useDialog
} from 'naive-ui';
import UserBrief from '../components/UserBrief.vue';
import CourseBrief from '../components/CourseBrief.vue';
import { onMounted, ref, watch, watchEffect, computed } from 'vue';
import { api } from '../api';
import { Add24Filled, Edit16Regular, Delete24Regular } from '@vicons/fluent';
import {
  College, CourseCommonWithSpecifics, Semester, dayName, Role,
  CourseSpecific, User, CourseCommon, CourseSpecificWithoutCommon
} from '../api/resp';
import { NewCourseRequest, QueryCoursesRequest } from '../api/req';
import { injectStore } from '../store';

const store = injectStore();
const message = useMessage();
const dialog = useDialog();

const currentUserRole = computed(() => store.state.user?.role);

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

const schedules = ref(store.state.schedules);
watchEffect(() => {
  schedules.value = store.state.schedules;
});

const courseSelecting = ref(false);
enum Operation {
  Select = 1, Withdraw, Open, EditSpecific, New, EditCommon
};
const courseSelectingModel = ref<{
  studentId?: string;
  student?: User;
  course?: CourseSpecificWithoutCommon;
  courseCommon: CourseCommon;
  operating: boolean;
  operation?: Operation;
}>({
  studentId: currentUserRole.value === Role.Admin ? '' : (store.state.user?.id + ''),
  student: store.state.user,
  operating: false,
  operation: Operation.Select,
  courseCommon: (undefined as any)
});

function confirmSelectCourse(course: CourseSpecificWithoutCommon, common: CourseCommon) {
  courseSelectingModel.value.operation = Operation.Select;
  courseSelectingModel.value.course = course;
  courseSelectingModel.value.courseCommon = common;
  courseSelecting.value = true;
}

function confirmWithdrawCourse(course: CourseSpecificWithoutCommon, common: CourseCommon) {
  courseSelectingModel.value.operation = Operation.Withdraw;
  courseSelectingModel.value.course = course;
  courseSelectingModel.value.courseCommon = common;
  courseSelecting.value = true;
}

onMounted(() => {
  store.dispatch('fetchColleges').then(() => {
    colleges.value = store.state.colleges;
  });
  store.dispatch('fetchSemesters').then(() => {
    semesters.value = store.state.semesters;
    currentSemesterId.value = store.state.currentSemester?.id!;
    queryModel.value.semester = store.state.currentSemester?.id!;
  });
});

const courses = ref<CourseCommonWithSpecifics[]>([]);
const totalPage = ref(0);

async function queryCourses(resetPage: boolean = false) {
  querying.value = true;
  if (resetPage === true) {
    queryModel.value.page = 1;
    courses.value.splice(0);
  }
  const coursesPage = await api.queryCourses(queryModel.value);
  totalPage.value = Math.ceil(coursesPage.total / coursesPage.pageSize);
  courses.value.push(...coursesPage.contents);

  querying.value = false;
}

function queryNextPageCourses() {
  if (queryModel.value.page < totalPage.value) {
    queryModel.value.page++;
    queryCourses(false);
  }
}

async function queryStudent() {
  courseSelectingModel.value.operating = true;
  try {
    courseSelectingModel.value.student = await api.fetchOtherUserInfo(courseSelectingModel.value.studentId!);
  } catch (e: any) {
    courseSelectingModel.value.student = undefined;
  }
  courseSelectingModel.value.operating = false;
}

async function selectOrWithdraw() {
  courseSelectingModel.value.operating = true;
  if (courseSelectingModel.value.operation === Operation.Select) {
    try {
      await api.selectCourse(parseInt(courseSelectingModel.value.studentId!), courseSelectingModel.value.course?.id!);
      message.success('选课成功！');
      courseSelectingModel.value.operation = Operation.Withdraw;
      store.dispatch('fetchSchedules');
    } catch (error) {
      message.error('选课失败: ' + (error as Error).message);
    }
  } else if (courseSelectingModel.value.operation === Operation.Withdraw) {
    try {
      await api.unselectCourse(parseInt(courseSelectingModel.value.studentId!), courseSelectingModel.value.course?.id!)
      message.warning('撤课成功！');
      courseSelectingModel.value.operation = Operation.Select;
      store.dispatch('fetchSchedules');
    } catch (error) {
      message.error('撤课失败: ' + (error as Error).message);
    }
  }
  courseSelectingModel.value.operating = false;
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


const isEditingCourseCommonModel = ref(false);
const courseCommonOperation = ref(Operation.EditCommon);
const courseCommonModelOperating = ref(false);
const editingCourseCommon = ref<CourseCommon>();
const courseCommonModel = ref<NewCourseRequest>({
  name: '',
  collegeId: 1,
  credits: 2,
  hours: 48,
});
const courseCommonModelRules: FormRules = {
  name: {
    required: true,
    pattern: /^.{2,20}$/,
    message: '请输入正确的课程名',
    trigger: 'input'
  },
  collegeId: {
    required: true,
    message: '请选择学院',
    trigger: 'input',
    pattern: /^.{1,}$/,
  },
  // 学分、学时总是会被 n-input-number 自动修正为有效的值，所以不写验证了
};
function enterEditCourseCommon(courseCommon: CourseCommon) {
  isEditingCourseCommonModel.value = true;
  courseCommonOperation.value = Operation.EditCommon;

  editingCourseCommon.value = courseCommon;
  courseCommonModel.value = {
    name: courseCommon.name,
    collegeId: courseCommon.college.id,
    credits: courseCommon.credits,
    hours: courseCommon.hours,
  };
}
function enterNewCourseCommon() {
  isEditingCourseCommonModel.value = true;
  courseCommonOperation.value = Operation.New;

  editingCourseCommon.value = undefined;
  courseCommonModel.value = {
    name: '',
    collegeId: colleges.value?.length ? 1 : 0,
    credits: 3,
    hours: 40,
  };
}
async function confirmCourseCommonOperation() {
  courseCommonModelOperating.value = true;
  if (courseCommonOperation.value === Operation.New) {
    console.log(editingCourseCommon.value)
    if (!editingCourseCommon.value || (await new Promise<boolean>((resolve, reject) => {
      dialog.warning({
        title: '警告',
        content: '您可能已经新建过该课程了，还要继续操作吗？',
        positiveText: '确认再次新建',
        negativeText: '取消',
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
      });
    }))) {
      try {
        editingCourseCommon.value = await api.newCourseCommon(courseCommonModel.value);
        message.success('新建课程成功！(查询列表可能需要刷新哦~)');
      } catch (error) {
        message.error('添加失败: ' + (error as Error).message);
      }
    }
  } else if (courseCommonOperation.value === Operation.EditCommon) {
    try {
      editingCourseCommon.value = await api.updateCourseCommon(editingCourseCommon.value!.id!, courseCommonModel.value);
      message.success('修改成功！(查询列表可能需要刷新哦~)');
    } catch (error) {
      message.error('修改失败: ' + (error as Error).message);
    }
  }
  courseCommonModelOperating.value = false;
}
</script>
