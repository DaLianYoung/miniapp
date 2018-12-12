const app = getApp()
import util from '../../utils/util'

Page({
  data: {
    show: false,
    areaList: {},
    region: '',
    regionLabel: '',

    companyCategory: '0',
    companyCategoryLabel: '保险公司',
    // companyCategoryList: [],

    companySubCategory: '',
    companySubCategoryLabel: '',
    companySubCategoryList: [],

    companyName: '',
    companyNameLabel: '',
    companyNameList: [],

    companyLevel: '',
    companyLevelLabel: '',
    companyLevelList: ['省级', '市级', '区级'],

    showAskUserInfoBtn: false,
    hasUserInfoAuth: false,
    hasBindPhone: false,
    userInfo: null,
    isDisableVerfiyBtn: false,
    verifyLabel: '获取验证码',
    registeInfo: {
      "avatarUrl": "",
      "cityCode": "",
      "companyNameCode": "",
      "companyType": "2", // 默认 查勘员 的公司类别 为 2 保险公司
      'insurance': '', // 保险 子类别
      "gender": "",
      "inviteCode": "",
      "mobile": "",
      "mobileCode": "",
      "name": "",
      "nickName": "",
      "provinceCode": "",
      "role": '1',
      "townCode": "",
      // "city": "",
      // "province": "",
      // "town": ""
    },
    isOurUser: false,
    isModifyPhone: true
  },
  onChange(event) {
    this.setData({
      'registeInfo.role': event.detail
    });
  },
  onLoad: function (routeParams) {
    wx.hideLoading()
    let _this = this
    let value = wx.getStorageSync('status')
    let _isOurUser = (value == 2 || value == '') ? false : true
    this.setData({
      hasBindPhone: _isOurUser,
      isOurUser: _isOurUser,
      isModifyPhone: _isOurUser
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              app.globalData.userInfo = res.userInfo
              let currentData = app.globalData.currentRegisterInfo
              _this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfoAuth: true,
                'registeInfo.avatarUrl': app.globalData.userInfo.avatarUrl,
                'registeInfo.country': app.globalData.userInfo.country,
                'registeInfo.gender': app.globalData.userInfo.gender,
                'registeInfo.language': app.globalData.userInfo.language,
                'registeInfo.nickName': app.globalData.userInfo.nickName
              })
              if (currentData) {
                _this.setData({
                  region: currentData ? currentData.townCode : '',
                  "registeInfo.cityCode": currentData ? currentData.cityCode : '',
                  "registeInfo.companyNameCode": currentData ? currentData.companyNameCode : '',
                  "registeInfo.companyType": currentData ? currentData.companyType : '',
                  "registeInfo.inviteCode": currentData ? currentData.inviteCode : '',
                  "registeInfo.mobile": currentData ? currentData.mobile : '',
                  "registeInfo.name": currentData ? currentData.name : '',
                  "registeInfo.provinceCode": currentData ? currentData.provinceCode : '',
                  "registeInfo.role": currentData ? (currentData.role + '') : '',
                  "registeInfo.roleName": currentData ? (currentData.roleName + '') : '',
                  "registeInfo.townCode": currentData ? currentData.townCode : ''
                })
              }
            }
          })
        } else {
          this.setData({
            showAskUserInfoBtn: true
          })
        }
      }
    })
    this.initArea()
    this.initCompanySubCategory()
    // this.initCompanyCategory()
  },
  // initCompanyCategory () {
  //   let _this = this
  //   util.request({
  //     path: '/sys/industry/all',
  //     method: 'GET'
  //   }, function (err, res) {
  //     if (res.code == 0) {
  //       _this.companySourceData = res.data
  //       _this.setData({
  //         'companyCategoryList': _this.companySourceData.map(item => { return item.name })
  //       })
  //     }
  //   })
  // },
  // companyCategoryChange (data) {
  //   let _this = this
  //   this.setData({
  //     'registeInfo.companyType': this.companySourceData[data.detail.value].id,
  //     companyCategoryLabel: this.companySourceData[data.detail.value].name,
  //     companyCategory: data.detail.value
  //   })
  //
  //   if (this.companySourceData[data.detail.value].id == 2) {
  //     util.request({
  //       path: '/sys/industryInsurance/all',
  //       method: 'GET'
  //     }, function (err, res) {
  //       if (res.code == 0) {
  //         _this.companySubSourceData = res.data
  //         _this.setData({
  //           'companySubCategoryList': _this.companySubSourceData.map(item => { return item.name })
  //         })
  //       }
  //     })
  //   } else {
  //     this.initCompanyName()
  //   }
  // },
  getRegionLabel () {
    let arr = []
    if (app.globalData.currentRegisterInfo) {
      arr.push(this.data.areaList['province_list'][app.globalData.currentRegisterInfo.provinceCode])
      arr.push(this.data.areaList['city_list'][app.globalData.currentRegisterInfo.cityCode])
      arr.push(this.data.areaList['county_list'][app.globalData.currentRegisterInfo.townCode])
    }
    this.setData({
      regionLabel: arr.length ? arr.join(',') : ''
    })
  },
  initArea () {
    let _this = this
    util.request({
      path: '/sys/area/list',
      method: 'GET'
    }, function (err, res) {
      _this.setData({
        areaList: res.DATA.DATA
      })
      _this.getRegionLabel()
    })
  },
  initCompanySubCategory () {
    let _this = this
    util.request({
      path: '/sys/industryInsurance/all',
      method: 'GET'
    }, function (err, res) {
      if (res.code == 0) {
        _this.companySubSourceData = res.data
        _this.setData({
          'companySubCategoryList': _this.companySubSourceData.map(item => { return item.name })
        })
      }
    })
  },
  companySubCategoryChange (data) {
    this.setData({
      'registeInfo.insurance': this.companySubSourceData[data.detail.value].id,
      companySubCategoryLabel: this.companySubSourceData[data.detail.value].name,
      companySubCategory: data.detail.value
    })
    this.initCompanyName()
  },
  checkCompanyNameList () {
    if (this.data.companyNameList.length == 0) {
      wx.showToast({
        title: '没有可用单位名称',
        icon: 'none',
        duration: 2000
      })
    }
  },
  initCompanyName () {
    let _this = this
    let code
    if (this.data.companyLevel == 0){
      code = this.data.registeInfo.provinceCode
    } if (this.data.companyLevel == 1) {
      code = this.data.registeInfo.cityCode
    } else {
      code = this.data.registeInfo.townCode
    }
    let data = {
      areaCode: code,
      industryCode: this.data.registeInfo.companyType
    }
    if (this.data.registeInfo.companyType == 2) {
      data.insurance = this.data.registeInfo.insurance
    }
    util.request({
      path: '/sys/company/list',
      method: 'GET',
      data: data
    }, function (err, res) {
      if (res.code == 0) {
        _this.companyNameSourceData = res.data
        _this.setData({
          'companyNameList': _this.companyNameSourceData.map(item => { return item.companyName })
        })
      }
    })
  },
  companyNameChange (data) {
    if (this.companyNameSourceData.length > 0) {
      this.setData({
        'registeInfo.companyNameCode': this.companyNameSourceData[data.detail.value].id,
        companyNameLabel: this.companyNameSourceData[data.detail.value].companyName,
        companyName: data.detail.value
      })
    }
  },
  companyLevelChange (data) {
    this.setData({
      companyLevel: data.detail.value,
      companyLevelLabel: this.data.companyLevelList[data.detail.value],
    })
    this.initCompanyName()
  },
  bindGetUserInfo(data) {
    if (data.detail.errMsg == "getUserInfo:fail auth deny") {
      return false
    }
    app.globalData.userInfo = data.detail.userInfo
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfoAuth: true,
      'registeInfo.avatarUrl': app.globalData.userInfo.avatarUrl,
      'registeInfo.country': app.globalData.userInfo.country,
      'registeInfo.gender': app.globalData.userInfo.gender,
      'registeInfo.language': app.globalData.userInfo.language,
      'registeInfo.nickName': app.globalData.userInfo.nickName
    })
  },
  submitRegiste() {
    let _this = this
    if (!this.checkPhone()) {
      return false
    }
    if (this.data.isOurUser && this.data.registeInfo.mobile != app.globalData.currentRegisterInfo.mobile && this.data.registeInfo.mobileCode == '') {
      wx.showToast({
        title: '手机验证码不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if (!this.data.registeInfo.townCode) {
      wx.showToast({
        title: '地址不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    if (this.data.registeInfo.role == 1) {
      // if (!this.registeInfo.companySubCategory) {
      //   wx.showToast({
      //     title: '单位子类不能为空',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
      if (!this.data.registeInfo.companyNameCode) {
        wx.showToast({
          title: '单位名称不能为空',
          icon: 'none',
          duration: 2000
        })
      }
    }
      // {
      //   "avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep8QbgMIXTeBIE2seEoebd9ib2qCwZR2sQIoTgj3epqYSTt76ic2qEtUOnZsBCM8AWbWT6M8Rg8P4Lg/132",
      //   "cityCode":"210200",
      //   "companyNameCode":2,
      //   "companyType":"2",
      //   "insurance":2,
      //   "gender":1,
      //   "inviteCode":"123",
      //   "mobile":"15904949205",
      //   "mobileCode":"123",
      //   "name":"123",
      //   "nickName":"魚兒",
      //   "provinceCode":"210000",
      //   "role":"1",
      //   "townCode":"210202",
      //   "country":"Bolivia",
      //   "language":"zh_CN",
      //   "town":"中山区",
      //   "city":"大连市",
      //   "province":"辽宁省"
      // }
    let params = Object.assign({}, this.data.registeInfo)
    if (this.data.registeInfo.role != 1) {
      delete params['companyNameCode']
      delete params['companyType']
      delete params['insurance']
    }
    console.log(params, 'aahhaha')
    return false
    util.request({
      path: '/app/register',
      method: 'POST',
      data: params
    }, function (err, res) {
      if (res.code == 0) {
        _this.setData({
          isModifyPhone: false
        })
        wx.showToast({
          title: '操作成功',
          icon: 'success',
          duration: 2000
        })
        wx.setStorageSync('status', 1)
        wx.switchTab({
          url: '../index/index',
          success: function (e) {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        })
      }
    })
  },
  openLocation() {
    if (!this.data.isOurUser) {
      this.setData({
        show: !this.show
      })
    }
  },
  onConfirm(data) {
    let strArr = []
    data.detail.values.forEach(item => {
      strArr.push(item.name)
    })
    this.setData({
      show: false,
      regionLabel: strArr.join(','),
      'registeInfo.townCode': data.detail.values[2].code,
      'registeInfo.cityCode': data.detail.values[1].code,
      'registeInfo.provinceCode': data.detail.values[0].code,
      'registeInfo.town': data.detail.values[2].name,
      'registeInfo.city': data.detail.values[1].name,
      'registeInfo.province': data.detail.values[0].name
    })
    this.initCompanyName()
  },
  onCancel() {
    this.setData({
      show: false
    })
  },
  requestVerifyCode () {
    let _this = this
    if (!this.checkPhone() || this.data.isDisableVerfiyBtn) {
      return false
    }

    util.request({
      path: '/app/register/code',
      method: 'GET',
      data: {
        mobile: this.data.registeInfo.mobile
      }
    }, function (err, res) {
      if (res.code == 0) {
        let count = 120
        _this.setData({
          isDisableVerfiyBtn: true,
          verifyLabel: `${count}s后再试`
        })
        _this.countTimer = setInterval(() => {
          count--
          if (count <= 0){
            _this.setData({
              isDisableVerfiyBtn: false,
              verifyLabel: `获取验证码`
            })
            _this.countTimer && clearInterval(_this.countTimer)
          } else {
            _this.setData({
              isDisableVerfiyBtn: true,
              verifyLabel: `${count}s后再试`
            })
          }
        }, 1000)
      }
    })
  },
  checkPhone (){
    var phone = this.data.registeInfo.mobile
    if(!(/^1[34578]\d{9}$/.test(phone))){
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    return true
  },
  inputgetName(e) {
    let name = e.currentTarget.dataset.name;
    let nameMap = {}
    if (name.indexOf('.')) {
      let nameList = name.split('.')
      if (this.data[nameList[0]]) {
        nameMap[nameList[0]] = this.data[nameList[0]]
      } else {
        nameMap[nameList[0]] = {}
      }
      nameMap[nameList[0]][nameList[1]] = e.detail.value
    } else {
      nameMap[name] = e.detail.value
    }
    this.setData(nameMap)
  },
  bindPhoneNum () {
    let _this = this
    if (!this.checkPhone()) {
      return false
    }
    if (this.data.registeInfo.mobileCode == '' || this.data.registeInfo.mobileCode == null){
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    util.request({
      path: '/app/binding',
      method: 'POST',
      data: {
        mobile: this.data.registeInfo.mobile,
        code: this.data.registeInfo.mobileCode
      }
    }, function (err, res) {
      if (res.code == 0) {
        _this.setData({
          isModifyPhone: false,
          'hasBindPhone': true,
          "registeInfo.companyNameCode": res.userInfo.companyNameCode,
          "registeInfo.companyType": res.userInfo.companyType || '2', // '新用户默认 单位类别 2保险公司'
          "registeInfo.inviteCode": res.userInfo.inviteCode,
          "registeInfo.name": res.userInfo.name,
          "registeInfo.role": res.userInfo.role || '1', // '新用户默认 1查勘员'
          "registeInfo.roleName": res.userInfo.roleName,
          'registeInfo.townCode': res.userInfo.townCode,
          'registeInfo.cityCode': res.userInfo.cityCode,
          'registeInfo.provinceCode': res.userInfo.provinceCode
          // ,
          // 'registeInfo.town': res.userInfo.town,
          // 'registeInfo.city': res.userInfo.city,
          // 'registeInfo.province': res.userInfo.province
        })
      }
    })
  }
})
