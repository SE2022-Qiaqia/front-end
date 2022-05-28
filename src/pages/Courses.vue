<template>
  <n-grid :cols="12" style="margin-bottom: 20px;">

    <n-grid-item :offset="1" :span="10">

      <n-spin :show="querying">

        <n-space vertical align="stretch" size="large">

          <!-- 课程查询条件 -->
          <query-course-form v-model:query="queryModel" :colleges-options="collegesOptions"
            :current-semester-id="currentSemesterId" :semesters-options="semestersOptions"
            :show-add="currentUserRole === Role.Admin" @add="enterNewCourseCommon" @update:query="queryCourses(true)" />

          <!-- 课程查询结果 -->
          <courses-result :courses="courses" :current-user-role="currentUserRole || 0"
            :is-selected-validator="specific => schedules.findIndex(x => x.id === specific.id) >= 0"
            @select="selectCourse" @withdraw="withdrawCourse" @edit-common="enterEditCourseCommon"
            @open="enterOpenCourse" @edit-specific="enterEditCourseSpecific" />

          <!-- 下一页/加载更多... -->
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
                <query-user v-model:user="courseSelectingModel.student"
                  v-model:querying="courseSelectingModel.operating" :default-user-id="courseSelectingModel.studentId"
                  :disabled="currentUserRole !== Role.Admin" />

                <n-button v-if="courseSelectingModel.operation === Operation.Select" type="primary"
                  :disabled="courseSelectingModel.student?.role !== Role.Student" @click="performSelectOrWithdraw">选课
                </n-button>
                <n-button v-else-if="courseSelectingModel.operation === Operation.Withdraw" type="error"
                  :disabled="courseSelectingModel.student?.role !== Role.Student" @click="performSelectOrWithdraw">撤课
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

      <!-- 对话框 —— 开设/编辑课头 -->
      <n-modal v-model:show="isEditingCourseSpecificModel">
        <n-card style="width: auto" :title="courseSpecificOperation === Operation.Open ? '开设课头' : '编辑课头'"
          :bordered="false" size="huge" role="dialog" aria-modal="true">
          <n-spin :show="courseSpecificOperating">
            <n-space>
              <n-card title="预览">
                <course-brief :course-common="editingCourseSpecific!.common" :course-specific="newCourseSpecific!" />
              </n-card>
              <!-- 按照页面逻辑，v-if 实际上是不需要的，但是由于courseSpecificModel没赋初值下面类型提示便可能是undefined -->
              <template v-if="courseSpecificModel">
                <course-specific-form v-model:course-specific="courseSpecificModel"
                  v-model:teacher="courseSpecificTeacher" :semesters-options="semestersOptions"
                  :for-open="courseSpecificOperation === Operation.Open" :loading="courseSpecificModelOperating"
                  @update:course-specific="performCourseSpecificOperation" />
              </template>
            </n-space>
          </n-spin>
        </n-card>
      </n-modal>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import {
  NSpace, NGrid, NGridItem, NForm, NFormItem, NInput, NInputNumber, NSelect, SelectOption, NButton, NSpin, NText, NModal, NCard, NIcon, FormRules, useMessage, useDialog
} from 'naive-ui';
import UserBrief from '@/components/user/UserBrief.vue';
import QueryUser from '@/components/user/QueryUser.vue';
import CourseBrief from '@/components/course/CourseBrief.vue';
import CoursesResult from '@/components/course/CoursesResults.vue';
import QueryCourseForm from '@/components/forms/QueryCourseForm.vue';
import CourseSpecificForm from '@/components/forms/CourseSpecificForm.vue';
import { onMounted, ref, computed } from 'vue';
import { api } from '@/api';
import { Add24Filled, Edit16Regular } from '@vicons/fluent';
import {
  CourseCommonWithSpecifics, Semester, Role,
  User, CourseCommon, CourseSpecificWithoutCommon
} from '@/api/resp';
import { NewCourseRequest, QueryCoursesRequest } from '@/api/req';
import { injectStore } from '@/store';
import { semesterToString } from '@/utils';
import { CourseSpecificModel } from '@/components/forms';

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

const collegesOptions = ref<SelectOption[]>([]);

const semesters = ref<Semester[]>([]);
const currentSemesterId = ref(0);
const semestersOptions = computed(() => semesters.value.map(s => ({
  value: s.id,
  label: semesterToString(s, s.id === currentSemesterId.value)
})));

const schedules = computed(() => store.state.schedules);

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

function selectCourse(course: CourseSpecificWithoutCommon, common: CourseCommon) {
  courseSelectingModel.value.operation = Operation.Select;
  courseSelectingModel.value.course = course;
  courseSelectingModel.value.courseCommon = common;
  courseSelecting.value = true;
}

function withdrawCourse(course: CourseSpecificWithoutCommon, common: CourseCommon) {
  courseSelectingModel.value.operation = Operation.Withdraw;
  courseSelectingModel.value.course = course;
  courseSelectingModel.value.courseCommon = common;
  courseSelecting.value = true;
}

onMounted(() => {
  store.dispatch('fetchColleges').then(() => {
    collegesOptions.value = store.state.colleges.map(c => ({
      value: c.id,
      label: c.name
    }))
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

async function performSelectOrWithdraw() {
  courseSelectingModel.value.operating = true;
  if (courseSelectingModel.value.operation === Operation.Select) {
    try {
      await api.selectCourse(courseSelectingModel.value.student!.id, courseSelectingModel.value.course?.id!);
      message.success('选课成功！');
      courseSelectingModel.value.operation = Operation.Withdraw;
      store.dispatch('fetchSchedules');
    } catch (error) {
      message.error('选课失败: ' + (error as Error).message);
    }
  } else if (courseSelectingModel.value.operation === Operation.Withdraw) {
    try {
      await api.unselectCourse(courseSelectingModel.value.student!.id, courseSelectingModel.value.course?.id!)
      message.warning('撤课成功！');
      courseSelectingModel.value.operation = Operation.Select;
      store.dispatch('fetchSchedules');
    } catch (error) {
      message.error('撤课失败: ' + (error as Error).message);
    }
  }
  courseSelectingModel.value.operating = false;
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
    collegeId: collegesOptions.value.length ? (collegesOptions.value[0].value as number) : 0,
    credits: 3,
    hours: 40,
  };
}
async function confirmCourseCommonOperation() {
  courseCommonModelOperating.value = true;
  if (courseCommonOperation.value === Operation.New) {
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

const courseSpecificOperating = ref(false);
const isEditingCourseSpecificModel = ref(false);
const courseSpecificOperation = ref(Operation.EditSpecific);
const courseSpecificModelOperating = ref(false);
const editingCourseSpecific = ref<{
  common: CourseCommon,
  specific?: CourseSpecificWithoutCommon,
}>();
const courseSpecificTeacher = ref<User>(store.state.user!); // 先默认分个人
const newCourseSpecific = computed<CourseSpecificWithoutCommon>(() => ({

  // 杂项（不可编辑）
  id: editingCourseSpecific.value?.specific?.id || 0,
  createdAt: editingCourseSpecific.value?.specific?.createdAt || '',
  updatedAt: editingCourseSpecific.value?.specific?.updatedAt || '',

  quotaUsed: editingCourseSpecific.value?.specific?.quotaUsed || 0,

  // 可编辑简单数据
  teacher: courseSpecificTeacher.value,
  location: courseSpecificModel.value!.location,
  quota: courseSpecificModel.value!.quota || 0,

  // 可编辑复合型数据
  semester: semesters.value.filter(s => s.id === courseSpecificModel.value?.semesterId)[0],
  courseSchedules: courseSpecificModel.value!.courseSchedules.map(x => ({
    ...x,
    id: 0,
    createdAt: '',
    updatedAt: '',
  })),

}));
const courseSpecificModel = ref<CourseSpecificModel>();

function enterOpenCourse(courseCommon: CourseCommon) {
  courseSpecificOperation.value = Operation.Open;
  isEditingCourseSpecificModel.value = true;
  editingCourseSpecific.value = {
    common: courseCommon,
  };
  courseSpecificModel.value = {
    courseCommonId: courseCommon.id,
    semesterId: currentSemesterId.value,
    teacherId: store.state.user!.id,
    location: '',
    quota: 20,
    courseSchedules: []
  };
}

function enterEditCourseSpecific(course: CourseSpecificWithoutCommon, courseCommon: CourseCommon) {
  courseSpecificOperation.value = Operation.EditSpecific;
  isEditingCourseSpecificModel.value = true;
  editingCourseSpecific.value = {
    common: courseCommon,
    specific: course,
  };
  courseSpecificTeacher.value = course.teacher;
  courseSpecificModel.value = {
    courseCommonId: courseCommon.id,
    semesterId: currentSemesterId.value,
    teacherId: course.teacher.id,
    location: course.location,
    quota: course.quota,
    courseSchedules: course.courseSchedules.map(c => ({ ...c }))
  };
}

async function performCourseSpecificOperation() {
  courseSpecificOperating.value = true;
  if (courseSpecificOperation.value === Operation.Open) {
    if (!editingCourseSpecific.value?.specific || (await new Promise<boolean>((resolve, reject) => {
      dialog.warning({
        title: '警告',
        content: '您可能已经开设过该课头了，还要继续操作吗？',
        positiveText: '确认再次开设',
        negativeText: '取消',
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
      });
    }))) {
      try {
        editingCourseSpecific.value!.specific = await api.openCourse(courseSpecificModel.value!);
        message.success('开设课头成功！(查询列表可能需要刷新哦~)');
      } catch (error) {
        message.error('开设失败: ' + (error as Error).message);
      }
    }
  } else if (courseSpecificOperation.value == Operation.EditSpecific) {
    try {
      editingCourseSpecific.value!.specific = await api.updateCourseSpecific(editingCourseSpecific.value!.specific!.id!, courseSpecificModel.value!);
      message.success('更新课头成功！(查询列表可能需要刷新哦~)');
    } catch (error) {
      message.error('更新课头失败: ' + (error as Error).message);
    }
  }
  courseSpecificOperating.value = false;
}
</script>
