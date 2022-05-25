<script setup lang="tsx">
import {
  NGrid, NGridItem, NSpace, NCard, NSpin, NButton,
  NTag, NTime, NText, NFormItem, NInput, NIcon, NDataTable, NModal,
  useMessage, DataTableColumns, useDialog
} from 'naive-ui';
import ProfileEditor from '../components/ProfileEditor.vue';
import { Add24Filled, Edit16Regular, Delete24Regular } from '@vicons/fluent';
import { onMounted, reactive, ref, watch } from 'vue';
import { injectStore } from '../store';
import { College, Role, User } from '../api/resp';
import { api } from '../api';
import { UpdateUserRequest } from '../api/req';

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

onMounted(async () => {
  updateUsers(pagination.page, pagination.pageSize);

  store.dispatch('fetchColleges').then(() => {
    colleges.value = store.state.colleges;
  });
});
const newUserInfo = ref<UpdateUserRequest>({
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
  newUserInfo.value = {
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
</script>

<template>
  <n-grid :cols="12" style="margin-bottom: 20px;">
    <n-grid-item :span="10" :offset="1">
      <!-- <n-card> -->
      <n-space vertical>

        <n-space justify="space-between">
          <n-space>
            <n-button ghost type="primary">
              <template #icon>
                <n-icon>
                  <Add24Filled />
                </n-icon>
              </template>
              <!-- TODO 增加用户 -->
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

      <n-modal v-model:show="isEditingUser">
        <n-card style="width: 80%" title="选课/撤课" :bordered="false" size="huge" role="dialog" aria-modal="true">
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