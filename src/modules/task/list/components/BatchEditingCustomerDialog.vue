<template>
  <base-modal
    title="批量编辑"
    :show.sync="visible"
    width="500px"
    class="batch-editing-customer-dialog"
  >
    <batch-form :fields="fields" ref="batchForm" />

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending"
        >确 定</el-button
      >
    </div>
  </base-modal>
</template>

<script>
import { formatDate } from "@src/util/lang";
import { FormFieldMap } from "@src/component/form/components";
import * as Utils from "@src/component/form/util";
/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";
import FormItem from "@src/component/form/FormItem.vue";

export default {
  name: "batch-editing-customer-dialog",
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
    selectedIds: {
      type: Array,
      default: () => [],
    },
  },
  data: () => {
    return {
      visible: false,
      pending: false,
    };
  },
  computed: {
    fields() {
      const { fields } = this.config;
      const list = [];
      fields.map((item) => {
        if (
          item.enabled != 0 &&
          item.formType != "taskNo" &&
          item.formType != "attachment" &&
          item.formType != "customer" &&
          item.formType != "relationProduct" &&
          item.formType != "relationCustomer"
        ) {
          list.push(item);
        }
      });
      return list;
    },
  },
  methods: {
    open() {
      this.visible = true;
    },
    buildParams() {
      let tv = null;
      const { form, selectedField: sf } = this.$refs.batchForm.returnData();

      let params = {
        mapJson: JSON.stringify({
          [sf.fieldName]: form[sf.fieldName],
        }),
        ids: this.selectedIds.join(","),
        fieldType: sf.isSystem,
      };

      if (sf.fieldName === "tags") {
        params.mapJson = JSON.stringify({
          [sf.fieldName]: form[sf.fieldName].map(({ id, tagName }) => ({
            id,
            tagName,
          })),
        });
      }
      if (sf.formType === "user") {
        tv = form[sf.fieldName];

        params.mapJson = JSON.stringify({
          [sf.fieldName]: {
            userId: tv.userId,
            displayName: tv.displayName,
            staffId: tv.staffId,
          },
        });
      }
      if (sf.fieldName === "manager") {
        tv = form[sf.fieldName];

        params.mapJson = JSON.stringify({
          [sf.fieldName]: {
            id: tv.userId,
            name: tv.displayName,
            staffId: tv.staffId,
          },
        });
      }
      if (sf.formType === "datetime") {
        tv = form[sf.fieldName];

        params.mapJson = JSON.stringify({
          [sf.fieldName]: tv,
        });
      }
      if (sf.formType === "date") {
        tv = form[sf.fieldName];

        params.mapJson = JSON.stringify({
          [sf.fieldName]: tv,
        });
      }

      if (sf.formType === "address") {
        tv = form[sf.fieldName];
        params.mapJson = JSON.stringify({
          [sf.fieldName]: {
            ...tv,
            all: [tv.province, tv.city, tv.dist, tv.address]
              .filter((str) => !!str)
              .join(""),
          },
        });
      }

      return params;
    },
    async onSubmit() {
      const { selectedIds, config } = this;
      const buildParams = this.buildParams();
      console.log(config.currentTaskType)
      let params = {
        taskIds: selectedIds,
        templateId: config.currentTaskType.id,
        fieldType: buildParams.fieldType,
        fieldName: "",
        value: "",
      };
      for (let key in JSON.parse(buildParams.mapJson)) {
        params.fieldName = key;
        params.value = JSON.parse(buildParams.mapJson)[key];
      }
      const { status, message, data } = await TaskApi.editBatchTask(params);
      if (status === 1) {
        let msg = message;
        if (data) {
          const { fail, succ } = data;
          msg += "： ";
          fail.forEach((item, index) => {
            msg += item.taskNo;
            if (index !== fail.length - 1) {
              msg += ",";
            }
          });
          msg += '。成功修改'+succ.length+'个';
        }
        this.$platform.alert(msg);
      } else {
        this.$platform.alert(message);
      }
      this.visible = false;
      this.$emit('update')
    },
  },
  components: {
    BatchForm: {
      name: "batch-form",
      props: {
        fields: {
          type: Array,
          default: () => [],
        },
      },
      data: () => {
        return {
          selectedField: {},
          form: {},
        };
      },
      mounted() {
        this.reset();
        this.buildForm();
      },
      methods: {
        returnData() {
          return {
            selectedField: this.selectedField,
            form: Object.assign({}, this.form),
          };
        },
        reset() {
          this.form = {};
          this.selectField(this.fields[0].fieldName);
        },
        dispatch({ type, bubbles = false, params = {} }) {
          const _dom = Array.prototype.slice
            .call(this.$el.children)
            .filter((d) => /form-item/g.test(d.className))[0];
          _dom.dispatchEvent(
            new CustomEvent(type, { detail: params, bubbles })
          );
        },
        buildForm() {
          if (Object.keys(this.form).length === this.fields.length) return;
          this.form = Utils.initialize(this.fields);

          this.fields.forEach((f) => {
            if (f.fieldName === "tags" && f.formType === "select") {
              this.form[f.fieldName] = [];
            }
          });
        },
        update(event) {
          /**
           * 选择团队使用的是单独的组件，不是统一的form组件，所以更新时的返回值不同，需要特殊处理
           */
          if (this.selectedField.fieldName === "tags") {
            this.form[this.selectedField.fieldName] = event;
            return;
          }

          const f = event.field;
          this.form[f.fieldName] = event.newValue;
        },
        selectField(val) {
          this.selectedField = this.fields.filter(
            (f) => f.fieldName === val
          )[0];

          /**
           * 1、切换的字段是系统地址时，根据默认值设置
           * 2、切换字段的时候，重新注册一遍，是因为： 切换前后两个字段类型相同，不会触发字段的组件的重新注册，form-item 的 field 就不会更新，还是切换之前的 field
           */

          // if (
          //   this.selectedField.formType === "address" &&
          //   this.selectedField.isSystem
          // ) {
          //   this.form[this.selectedField.fieldName] = {
          //     province: province || "",
          //     city: city || "",
          //     dist: dist || "",
          //   };
          // }

          this.dispatch({
            type: "form.add.field",
            params: {
              value: () => this.form[this.selectedField.fieldName],
              field: this.selectedField,
              fieldName: this.selectedField.fieldName,
            },
          });

          this.dispatch({
            type: "form.clear.validate",
          });
        },
        renderSelector() {
          if (!this.fields) return null;
          return (
            <el-select
              value={this.selectedField.fieldName}
              placeholder="请选择需要修改的字段"
              onChange={this.selectField}
            >
              {this.fields.map((f) => (
                <el-option
                  key={f.fieldName}
                  label={f.displayName}
                  value={f.fieldName}
                ></el-option>
              ))}
            </el-select>
          );
        },

        renderInput(h) {
          const sf = this.selectedField;

          if (!sf.formType) return null;

          if (sf.fieldName === "tags") {
            return h("biz-team-select", {
              props: {
                multiple: true,
                value: this.form[sf.fieldName],
              },
              on: {
                input: (event) => this.update(event),
              },
            });
          }

          const comp = FormFieldMap.get(sf.formType);
          const data = {
            props: {
              field: sf,
              value: this.form[sf.fieldName],
              placeholder: Utils.genPlaceholder(sf),
            },
            on: {
              update: (event) => this.update(event),
            },
          };

          // if (sf.formType === 'address' && !sf.isSystem) {
          //   data.props.disableMap = true;
          // }

          return h(comp.build, data);
        },
      },
      render(h) {
        return (
          <div>
            <div class="item">
              <label class="form-name">修改字段</label>
              <div>{this.renderSelector()}</div>
            </div>
            <form-item label={"修改为"}>{this.renderInput(h)}</form-item>
          </div>
        );
      },
    },
    components: {
      [FormItem.name]: FormItem,
    },
  },
};
</script>

<style lang="scss">
.batch-editing-customer-dialog {
  .base-modal-body {
    padding: 10px 30px 0;
  }

  .form-name,
  .form-item label {
    width: 70px;
    padding: 0;
    line-height: 32px;
  }

  .item {
    display: flex;
    justify-content: space-between;
    line-height: 32px;
    div {
      flex-grow: 1;
      .el-select {
        width: 100%;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
