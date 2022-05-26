<script setup lang="tsx">
import {
  NGrid, NGridItem, NSpace, NCard, NSpin, NButton,
  NTag, NTime, NText, NForm, NFormItem, NInput, NInputNumber,
  NSelect, NIcon, NDataTable, NModal,
  useMessage, DataTableColumns, useDialog, FormRules, SelectOption, FormInst
} from 'naive-ui';
import ProfileEditor from '../components/ProfileEditor.vue';
import { Add24Filled, Edit16Regular, Delete24Regular } from '@vicons/fluent';
import { onMounted, reactive, ref, watch } from 'vue';
import { injectStore } from '../store';
import { College, Role, User } from '../api/resp';
import { api } from '../api';
import { NewUserRequest, UpdateUserRequest } from '../api/req';

const store = injectStore();
const message = useMessage();
const dialog = useDialog();

const pagination = reactive({
  page: 1,
  pageCount: 0,
  pageSize: 10,
  itemCount: 100,

  pageSizes: [10, 20, 30],
  showQuickJumper: true,
  showSizePicker: true,

  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
});

const users = ref<User[]>([]);
const deleting = reactive<{ [key: number]: boolean | undefined }>({});
const loading = ref(true);
const columns = ref<DataTableColumns>([
  {
    key: 'id',
    title: 'ID',
  },
  {
    key: 'username',
    title: '用户名',
  },
  {
    key: 'realName',
    title: '真实姓名',
  },
  {
    key: 'college.name',
    title: '学院',
  },
  {
    key: 'entranceYear',
    title: '入学年份',
  },
  {
    key: 'createdAt',
    title: '注册时间',
    render(rowData, rowIndex) {
      const user = rowData as unknown as User;
      return (<NTime time={new Date(user.createdAt)}></NTime>);
    }
  },
  {
    key: 'updatedAt',
    title: '更新时间',
    render(rowData, rowIndex) {
      const user = rowData as unknown as User;
      return (<NTime time={new Date(user.updatedAt)}></NTime>);
    }
  },
  {
    key: 'role',
    title: '角色',
    render(rowData, rowIndex: number) {
      rowData as unknown as User;
      if (rowData.role === Role.Admin) {
        return (<NTag type="warning">管理员</NTag>);
      } else if (rowData.role === Role.Teacher) {
        return (<NTag type="primary">教师</NTag>);
      } else if (rowData.role === Role.Student) {
        return (<NTag type="info">学生</NTag>);
      } else {
        return (<NTag type="error">ERR</NTag>);
      }
    }
  },
  {
    key: 'actions',
    title: '操作',
    render(rowData, rowIndex: number) {
      const user = rowData as unknown as User;
      const slotsEdit = {
        icon: () => (<NIcon><Edit16Regular /></NIcon>),
      };
      const slotsDelete = {
        icon: () => (<NIcon><Delete24Regular /></NIcon>),
      };
      return (
        <NSpace>
          <NButton round ghost v-slots={slotsEdit} type="info"
            onClick={() => {
              queryUserId.value = user.id + '';
              isEditingUser.value = true;
              editedUser.value = user;
            }}></NButton>
          <NButton round ghost v-slots={slotsDelete} type="error" loading={!!(deleting[user.id])}
            onClick={() => deleteUser(user)}
          ></NButton>
        </NSpace>
      )
    }
  },
]);

async function updateUsers(page: number, size: number) {
  loading.value = true;
  api.fetchUserList({ page, size })
    .then(data => {
      users.value = data.contents;
      pagination.page = data.pageNo;
      pagination.itemCount = data.total;
      pagination.pageCount = Math.ceil(data.total / size);
      loading.value = false;
    })
    .catch(err => {
      message.error('获取用户列表失败！' + err.message);
      loading.value = false;
    })
}

async function handlePageChange(page: number) {
  updateUsers(page, pagination.pageSize);
}

async function handlePageSizeChange(size: number) {
  updateUsers(pagination.page, size);
}

function deleteUser(user: User) {
  dialog.warning({
    title: "删除",
    content: `确认删除用户"${user.realName}(${user.username})"嘛？`,
    positiveText: "确认",
    negativeText: "取消",
    async onPositiveClick() {
      try {
        deleting[user.id] = true;
        await api.deleteUser(user.id);
        message.info(`用户"${user.realName}(${user.username})"已被删除！`);
        updateUsers(pagination.page, pagination.pageSize);
      } catch (error) {
        message.error(`删除用户失败！${(error as Error).message}`);
      } finally {
        deleting[user.id] = false;
      }
    }
  });
}

const colleges = ref<College[]>([]);
const collegesOptions = ref<SelectOption[]>();
watch(() => colleges.value, () => {
  collegesOptions.value = colleges.value.map(c => ({
    value: c.id,
    label: c.name
  }));
});

onMounted(async () => {
  updateUsers(pagination.page, pagination.pageSize);

  store.dispatch('fetchColleges').then(() => {
    colleges.value = store.state.colleges;
  });
});
const updatingUserInfo = ref<UpdateUserRequest>({
  username: '',
  realName: '',
  collegeId: 0,
  role: Role.Student,
  entranceYear: new Date().getFullYear(),
});
const queryUserId = ref<string>('');
const isQueryingUser = ref(false);
const editedUser = ref<User>();
const isEditingUser = ref(false);
watch(() => editedUser, () => {
  updatingUserInfo.value = {
    username: editedUser.value!.username,
    realName: editedUser.value!.realName,
    collegeId: editedUser.value!.college.id,
    role: editedUser.value!.role,
    entranceYear: editedUser.value!.entranceYear,
  };
})

async function justEdit() {
  queryUserId.value = '';
  editedUser.value = undefined;
  isEditingUser.value = true;
}

async function queryStudent() {
  isQueryingUser.value = true;
  try {
    editedUser.value = await api.fetchOtherUserInfo(queryUserId.value);
  } catch (e: any) {
    editedUser.value = undefined;
  }
  isQueryingUser.value = false;
}

const updatingInfo = ref(false);
async function updateUserInfo(info: UpdateUserRequest) {
  try {
    updatingInfo.value = true;
    editedUser.value = await api.updateUserInfo(editedUser.value!.id, info);
    message.success('更新个人信息成功！');
    updateUsers(pagination.page, pagination.pageSize);
  } catch (error) {
    message.error('更新个人信息失败！' + (error as any).message);
  } finally {
    updatingInfo.value = false;
  }
}

const updatingPassword = ref(false);
async function updatePassword(password: string) {
  try {
    updatingPassword.value = true;
    await api.updateUserPassword(editedUser.value!.id, password);
    message.success('修改密码成功！');
  } catch (error) {
    message.error('修改密码失败！' + (error as any).message);
  } finally {
    updatingPassword.value = false;
  }
}


const rolesOptions: SelectOption[] = [
  {
    value: Role.Student,
    label: '学生',
  },
  {
    value: Role.Teacher,
    label: '教师',
  },
  {
    value: Role.Admin,
    label: '管理员',
  }
];

const isAddingUser = ref(false);
const isSubmittingNewUser = ref(false);
const date = new Date();
const addingUserInfo = ref<NewUserRequest & {
  passwordRepeat: string;
}>({
  id: parseInt(date.getFullYear() + date.getTime().toString().substring(0, 9)),
  username: '',
  realName: '',
  collegeId: 1,
  password: '',
  passwordRepeat: '',
  role: Role.Student,
  entranceYear: new Date().getFullYear(),
});

const formRules: FormRules = {
  id: [
    {
      required: true,
      message: '请输入正确的学号',
      trigger: ['input', 'blur'],
      validator(rule, value, callback) {
        return value > 0;
      },
    },
    {
      required: true,
      message: '学号已被使用',
      trigger: 'blur',
      validator(rule, value, callback) {
        return queriedUser.value === undefined || queriedUser.value.id !== value;
      },
    }
  ],
  username: {
    required: true,
    pattern: /^.{5,20}$/,
    message: '请输入正确的用户名',
    trigger: 'input'
  },
  realName: {
    required: true,
    pattern: /^.{1,15}$/,
    message: '请输入正确的姓名',
    trigger: 'input'
  },
  password: {
    required: true,
    pattern: /^.{6,}$/,
    message: '请输入密码, 至少6位',
    trigger: 'input'
  },
  passwordRepeat: [
    {
      required: true,
      message: '请确认密码',
      trigger: ['input', 'blur']
    },
    {
      message: '两次密码不一致',
      trigger: 'input',
      validator(rule, value, callback) {
        return addingUserInfo.value.password.startsWith(value) && addingUserInfo.value.password.length >= value.length;
      }
    },
    {
      message: '两次密码不一样',
      trigger: ['blur', 'password-input'],
      validator(rule, value, callback) {
        return addingUserInfo.value.password === value;
      }
    }
  ],
  collegeId: {
    required: true,
    message: '请选择学院',
    trigger: 'input',
    pattern: /^.{1,}$/,
  }
};

const formRef = ref<FormInst | null>(null);
async function confirmAddingUser() {
  try {
    await formRef.value?.validate();
  } catch (error) {
    return;
  }

  try {
    isSubmittingNewUser.value = true;
    if (!await api.newUser(addingUserInfo.value)) {
      // 正常来说后端添加用户失败会直接给错误代码，这个分支不会发生
      throw new Error('');
    }
    message.success('添加新用户成功！');
  } catch (error) {
    message.error('添加用户失败！' + (error as any).message);
  } finally {
    isSubmittingNewUser.value = false;
  }
}

const queriedUser = ref<User>();
async function queryUserInAddModal() {
  try {
    const res = await api.fetchOtherUserInfo(addingUserInfo.value.id);
    if (res?.id === addingUserInfo.value.id) {
      queriedUser.value = res;
    }
  } catch (e: any) {
    queriedUser.value = undefined;
  }
}
</script>

<template>
  <n-grid :cols="12" style="margin-bottom: 20px;">
    <n-grid-item :span="10" :offset="1">
      <!-- <n-card> -->
      <n-space vertical>

        <n-space justify="space-between">
          <n-space>
            <n-button ghost type="primary" @click="isAddingUser = true">
              <template #icon>
                <n-icon>
                  <Add24Filled />
                </n-icon>
              </template>
              增加
            </n-button>
            <n-button ghost type="info" @click="justEdit">
              <template #icon>
                <n-icon>
                  <Edit16Regular />
                </n-icon>
              </template>
              编辑
            </n-button>
          </n-space>
        </n-space>

        <n-data-table remote :columns="columns" :data="users" :pagination="pagination" :loading="loading"
          @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />

      </n-space>
      <!-- </n-card> -->

      <!-- 添加用户模态框 -->
      <n-modal v-model:show="isAddingUser">
        <n-card style="width: 50%" title="添加" :bordered="false" size="huge" role="dialog" aria-modal="true">
          <n-form ref="formRef" :model="addingUserInfo" :rules="formRules" label-placement="left" label-width="auto"
            require-mark-placement="right-hanging" :disabled="isSubmittingNewUser">
            <n-form-item label="学号:" path="id">
              <n-space align="center">
                <n-input-number v-model:value="addingUserInfo.id" placeholder="请输入学号" clearable :min="1"
                  :max="8888888888888888" @update:value="queryUserInAddModal" />
                <n-text v-if="queriedUser !== undefined" type="error">
                  {{ queriedUser.realName }}({{ queriedUser.id }} - {{ queriedUser.username }})
                </n-text>
              </n-space>
            </n-form-item>
            <n-form-item label="用户名:" path="username">
              <n-input v-model:value="addingUserInfo.username" placeholder="请输入用户名" clearable />
            </n-form-item>
            <n-form-item label="密码:" path="password">
              <n-input v-model:value="addingUserInfo.password" type="password" placeholder="请输入密码" />
            </n-form-item>
            <n-form-item label="确认密码:" path="passwordRepeat">
              <n-input v-model:value="addingUserInfo.passwordRepeat" type="password" placeholder="请再次确认密码" />
            </n-form-item>
            <n-form-item label="姓名:" path="realName">
              <n-input v-model:value="addingUserInfo.realName" placeholder="请输入姓名" clearable />
            </n-form-item>
            <n-form-item label="学院: " path="collegeId">
              <n-select v-model:value="addingUserInfo.collegeId" placeholder="请选择学院" :options="collegesOptions" />
            </n-form-item>
            <n-form-item label="角色: " path="role">
              <n-select v-model:value="addingUserInfo.role" placeholder="请选择角色" :options="rolesOptions" />
            </n-form-item>
            <div style="display: flex; justify-content: flex-end">
              <n-button round ghost type="primary" @click="confirmAddingUser" :loading="isSubmittingNewUser">
                <template #icon>
                  <n-icon>
                    <Add24Filled />
                  </n-icon>
                </template>
                添加用户
              </n-button>
            </div>
          </n-form>
        </n-card>
      </n-modal>

      <!-- 编辑用户模态框 -->
      <n-modal v-model:show="isEditingUser">
        <n-card style="width: 80%" title="编辑" :bordered="false" size="huge" role="dialog" aria-modal="true">
          <n-spin :show="isQueryingUser">
            <n-space vertical>

              <n-form-item label="学生ID:" label-placement="left" style="max-width: 50%">
                <n-input v-model:value="queryUserId" placeholder="请输入学号, 回车查询" clearable
                  @keydown.enter="queryStudent" />
              </n-form-item>
              <profile-editor v-if="!!editedUser" :user="editedUser" :colleges="colleges" :updating-info="updatingInfo"
                :updating-password="updatingPassword" @update-info="updateUserInfo" @update-password="updatePassword" />
              <n-text v-else>未找到该用户</n-text>

            </n-space>
          </n-spin>
        </n-card>
      </n-modal>
    </n-grid-item>
  </n-grid>
</template>