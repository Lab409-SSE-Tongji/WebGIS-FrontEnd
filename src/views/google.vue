<template>
  <div class="wrapper wrapper-content animated fadeInRight">

    <PointInfoWindow :clickPoint="clickPoint" :editable="true" @onCurPointStatusChange="onCurPointStatusChange"></PointInfoWindow>

    <div class="hide" id="map-msg-line-parent">
      <div id="map-msg-line">
        <div class="form-group form-group-sm ">
          <i class="fa fa-map-marker icon"></i>
          <label>起点</label>
          <span>{{lng}}, {{lat}}</span>
        </div>
        <div class="form-group form-group-sm ">
          <i class="fa fa-map-marker icon"></i>
          <label>终点</label>
          <span>{{lng2}}, {{lat2}}</span>
        </div>
        <div class="form-group form-group-sm">
          <i class="fa fa-line-chart icon"></i>
          <label>距离</label>
          <span>{{dis}}</span>
        </div>
        <div class="form-group form-group-sm">
          <select v-model="curPointStatus" class="form-control">
            <option value="0">选择状态</option>
            <option value="GOOD">GOOD</option>
            <option value="BREAK">BREAK</option>
          </select>
        </div>

        <div class="form-group form-group-sm">
          <button type="button" @click="deleteLineBtnClick" class="btn btn-info btn-half-left">删除</button>
          <button type="button" class="btn btn-danger btn-half-right" id="lineMapMsgBtn">关闭</button>
        </div>
      </div>
    </div>
    <!-- 图层操作条 -->
    <nav class="navbar navbar-default">
      <form class="form-inline">
        <!--<label>mapId: {{mapId}}</label>-->
        <select v-model="curLayerId"  class="form-control">
          <option value="0">选择图层</option>
          <option v-for="selectLayer in selectLayers" :value="selectLayer.id">
            {{selectLayer.name}}
          </option>
        </select>

        <span v-if="!curHistory">
          <button type="button" @click="deleteLayer" class="btn btn-danger">删除当前图层</button>

          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#create-layer-modal">
            创建图层
          </button>

          <span class="dropdown" v-if="curLayerType==='YJG' || curLayerType==='LD'">
            <button class="btn btn-default dropdown-toggle" type="button" id="createPointMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              添加点
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="createPointMenu">
          <li><a v-on:click="addGoodPoint">添加好点</a></li>
          <li><a v-on:click="addBadPoint">添加坏点</a></li>
        </ul>
          </span>

          <span class="dropdown" v-if="curLayerType==='XSG' && curPoint===null">
            <button class="btn btn-default dropdown-toggle" type="button" id="createLineMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              添加线
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="createLineMenu">
              <li><a @click="addGoodLine">添加好线</a></li>
              <li><a @click="addBadLine">添加坏线</a></li>
            </ul>
          </span>

          <button type="button" @click="stopAddLine" class="btn btn-default" v-if="curLayerType==='XSG' && curPoint!==null">停止</button>
          <button type="button" @click="submitChange" class="btn btn-info">提交</button>
          <button id="show3d" type="button" @click="show3d" class="btn btn-info">展示3D</button>

          <div class="form-group right-float">
            <button type="button" @click="reverseCurHistory" class="btn btn-info right-float">查看历史版本</button>
            <button type="button" @click="createHistory" class="btn btn-info right-float">创建历史版本</button>
            <button type="button" @click="compareHistoryMap" class="btn btn-info right-float">历史版本对比</button>
            <button type="button" @click="calculateDis" id="calDis" class="btn btn-info right-float">{{disText}}</button>
            <button class="btn btn-info" @click="isShowingOwnRepairs = true"><i class="fa fa-eye"></i>报修信息</button>
          </div>
        </span>

        <span v-if="curHistory">
          <a @click="reverseCurHistory" class="right-float gis-icon">
            <i class="fa fa-chevron-circle-left fa-2x" aria-hidden="true"></i>
          </a>

          <select v-model="curHistory"  class="form-control">
            <option value="1">选择历史版本</option>
            <option v-for="history in histories" :value="history.id">
              {{history.description}}
            </option>
          </select>

          <button type="button" @click="deleteHistory" class="btn btn-danger">删除当前版本</button>

        </span>
      </form>
    </nav>

    <div id="withThree">
      <div id="main-canvas" style="height:100%;width:50%;">
      </div>
      <!-- google map -->
      <div class="ibox-content" id="map" style="position: relative; height: 620px"></div>
    </div>
    <!-- create layer modal -->
    <div class="modal fade" id="create-layer-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="myModalLabel">创建图层</h4>
          </div>
          <div class="modal-body">
            <form>
              <select class="form-control" v-model="createLayerType">
                <option value="0">图层类型</option>
                <option value="YJG"> 窨井盖 </option>
                <option value="XSG"> 道路维修 </option>
                <option value="LD"> 路灯 </option>
              </select>

              <div class="checkbox">
                <label>
                  <input type="checkbox" v-model="isCreatingWithFile" value="1">
                  根据文件创建图层
                </label>
              </div>
              <div class="form-group" v-if="isCreatingWithFile">
                <input type="file" name="file" id="file" @change="previewFile">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">&nbsp;取消&nbsp;</button>
            <button type="button" class="btn btn-primary" @click="createLayer">&nbsp;创建&nbsp;</button>
          </div>
        </div>
      </div>
    </div>

    <vodal :show="isShowingOwnRepairs"
           :animation="'zoom'"
           @hide="isShowingOwnRepairs = false"
           :width="800"
           :height="500">
      <RepairTable :ownRepairs="ownRepairs" @onUpdateCenterClick="onUpdateCenterClick"></RepairTable>
    </vodal>
  </div>

</template>

<script>
  import utils from '../service/utils'
  import HistoryService from '@/service/httpService/HistoryService'
  import MapService from '@/service/mapService'
  import RepairService from '@/service/httpService/RepairService'

  import Vodal from 'vodal'
  import RepairTable from './components/RepairTable.vue'
  import PointInfoWindow from './components/PointInfoWindow.vue'
  export default {
    name: 'GoogleMapPage',
    data: function () {
      return {
        map: null,
        mapId: this.$route.params.mapId,
        layerDatas:null,
        disText: "测距",
        lng: "lng",
        lat: "lat",
        radius: 0,
        lng2: "lng2",
        lat2: "lat2",
        dis: 0,
        selectLayers:[],

        // 当前layer id以及map数据
        curLayerId:0,
        curLayerType:null,
        curLayerMapDatas:[],
        isDis: true,

        // 当前point 以及它的状态
        curPointStatus:0,
        curPoint: '',
        clickPoint: '',
        curLine: null,
        tmpPoint: null,
        mapClickListener: null,

        isCreatingWithFile: false,
        createLayerType: 0,
        curFile: null,

        /* history */
        curHistory: 0,
        histories: null,

        isShowingOwnRepairs: false,
        ownRepairs: []
      }
    },
    components: {
      Vodal,
      RepairTable,
      PointInfoWindow
    },
    methods: {
      // 初始化 地图 从数据库得到layerDatas 初始化selectList
      initMap: function () {
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: global.MAP.INIT_LAT, lng: global.MAP.INIT_LNG },
          zoom: global.MAP.INIT_ZOOM
        });
        if(false){
          $('#main-canvas').css("display","block");
//          startThree(mockJson);
        }
      },
      show3d: function () {
        if($("#main-canvas").css("display")==="none"){
          $("#show3d").html("隐藏3D");
          $("#main-canvas").css("display","block");
//          $('#main-canvas').html("");
//          startThree(mockJson);
        }else{
          $("#show3d").html("展示3D")
          $("#main-canvas").css("display","none")
        }
      },
      getLayerDatas: function (mapId) {
        var self = this;
        this.$http.get(baseUrl + '/layer/layers/repair?mapId='+mapId,
          {
            emulateJSON: true
          }
        ).then(function (response){
          let responseBody = response.body
          if (responseBody.code === 200) {
            self.layerDatas= responseBody.data;
            self.setLayerSelect(self.layerDatas.layerList);
          }
        });
      },
      setLayerSelect: function (layerList, isHistory) {
        this.selectLayers = [];
        console.log(layerList)
        layerList.forEach((layerData, index) => {
          this.selectLayers.push({
            id: isHistory? index + 1 : layerData.id,
            "name": this.getLayerNameWithType(layerData.type || layerData.data.type)
          });
        })
      },

      //添加图层
      createLayer: function () {
        let self = this;
        let formData = null;
        let postUrl = null;
        let postOptions = null;
        if(this.isCreatingWithFile) {
          postUrl = baseUrl + '/layer/layers';
          formData = new FormData();
          formData.append('file', this.curFile);
          formData.append('mapId', this.mapId);
          formData.append('type', this.createLayerType);
          postOptions = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          };
        }
        else{
          postUrl = baseUrl + '/layer/emptyLayers';
          formData = {
            mapId: this.mapId,
            type: this.createLayerType
          };
          postOptions = {
            emulateJSON: true
          };
        }

        this.$http.post(postUrl, formData, postOptions).then(function (response){
          let responseBody = response.body
          if (responseBody.code === 200) {
            self.getLayerDatas(self.mapId)
            toastr.success("创建成功！")
            $('#create-layer-modal').modal('toggle')
          }
          else{
            toastr.error("创建失败！")
          }
        }, function () {
          toastr.error("创建失败！")
        });
      },
      previewFile: function (event) {
        this.curFile = event.target.files[0];
      },

      // 删除图层
      deleteLayer:function () {
        var self = this;
        if(this.curLayerId!==0) {
          this.$http.delete(baseUrl + '/layer/layers/id?mapId=' + this.mapId +"&layerId="+this.curLayerId,
            {
              emulateJSON: true
            }
          ).then(function (response){
            let responseBody = response.body
            if (responseBody.code === 200) {
              self.getLayerDatas(self.mapId);
              self.curLayerId = 0;
              toastr.success("删除成功！")
            }
          });
        }
      },

      clearMap:function (isRemoveFromMap) {
        if(isRemoveFromMap){
          this.curLayerMapDatas.forEach(function (curLayerMapData) {
            curLayerMapData.setMap(null);
          });
        }
        this.curLayerMapDatas = [];
      },

      // 创建一个point
      createPoint:function (map,centerPos, pointStatus) {
        if (this.curLayerType === 'YJG') {
          return MapService.createWellMarker(centerPos, map, MARKER_COLOR[pointStatus])
        } else if (this.curLayerType === 'LD') {
          return MapService.createLampMarker(centerPos, map, MARKER_COLOR[pointStatus])
        }
      },
      createPointDetail: function (pointPos, pointStatus, radius, specialId, url, pointId, repairIds, index) {
        var cityCircle = this.createPoint(this.map, pointPos, pointStatus);

        cityCircle.pointStatus = pointStatus;
        cityCircle.specialId = specialId
        cityCircle.radius = radius
        cityCircle.url = url
        cityCircle.pointId = pointId
        cityCircle.repairIds = repairIds
        cityCircle.index = index

        this.curLayerMapDatas.push(cityCircle);

        this.addPointClickListener(cityCircle);
      },
      createLine: function (map, pointList, color) {
        var flightPath = new google.maps.Polyline({
          path: pointList,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 10,
          editable: true
        });

        flightPath.setMap(map);
        this.addLineClickListener(flightPath);
        return flightPath;
      },

      //根据点的状态创建一个点
      getColorWithStatus: function (status) {
        return MARKER_COLOR[status] || 'black'
      },
      addPoint: function (pointStatus) {
//        let radius = parseFloat(prompt('请输入半径', ''));
        let radius = 1;

        var mapClickListener = google.maps.event.addListener(this.map, 'click', (event) => {
          var latLng = event.latLng;
          this.lng = latLng.lng();
          this.lat = latLng.lat();

          if(this.checkPointConflict(latLng, radius)){
            google.maps.event.removeListener(mapClickListener);

            toastr.error('当前窨井盖与其他窨井盖有覆盖关系，无法创建！');
            return;
          }

          this.createPointDetail(latLng, pointStatus, radius, utils.getNowTimeStamp());
          google.maps.event.removeListener(mapClickListener);
        });
      },
      addGoodPoint: function () {
        this.addPoint("GOOD");
      },
      addBadPoint: function () {
        this.addPoint("BAD");
      },
      checkPointConflict: function (point, radius) {
        let self = this;
        let flag = false;
        this.curLayerMapDatas.forEach(function (point2) {
          if(self.getTwoPointsDis(point2.getPosition(), point) <= Math.abs(point2.radius+radius))
            flag = true;
        });
        return flag;
      },

      // 添加线
      // tmpPoint为第一个点，点击第二次以后删除该点
      addLine: function (lineStatus) {
        var self = this;
        self.mapClickListener = google.maps.event.addListener(this.map, 'click', function(event) {
          var latLng = event.latLng;
          let tmpPoint = {lng:latLng.lng(), lat:latLng.lat()}
          self.lng = latLng.lng().toFixed(6);
          self.lat = latLng.lat().toFixed(6);
          if(self.curPoint){
            let curLine = self.createLine(self.map, [self.curPoint, tmpPoint],self.getColorWithStatus(lineStatus));
            curLine.lineStatus = lineStatus;
            self.curLayerMapDatas.push(curLine);
            if(self.tmpPoint){
              self.tmpPoint.setMap(null);
              self.tmpPoint = null;
            }
          }
          else{
            self.tmpPoint= self.createPoint(self.map, latLng, self.getColorWithStatus(lineStatus));
          }
          self.curPoint = tmpPoint;
        });
      },
      addGoodLine: function () {
        this.addLine("GOOD");
      },
      addBadLine: function () {
        this.addLine("BAD");
      },
      calculateDis: function () {
        if(this.isDis) {
          this.addLine("DIS");
          this.isDis = false;
          this.disText = "清空";
        }
        else {
          this.curLayerMapDatas.forEach(function (f) {
            f.setMap(null);
          });
          this.isDis = true;
          this.curPoint = null;
          this.disText = "测距";
        }

      },

      stopAddLine: function () {
        google.maps.event.removeListener(this.mapClickListener);
        this.mapClickListener = null;
        if(this.tmpPoint!==null && this.tmpPoint!== undefined){
          this.tmpPoint.setMap(null);
          this.tmpPoint = null;
        }
        this.curPoint = null;
      },

      // 根据layer id得到某一图层的数据
      getLayerData:function (layerId) {
        if(this.layerDatas.layerList){
          let layerList = this.layerDatas.layerList;
          for(let i = 0;i< layerList.length;i++){
            if(layerId===layerList[i].id)
              return layerList[i].data;
          }
        }
        else if(this.layerDatas.data){
          return this.layerDatas.data[layerId-1];
        }
        return null;
      },

      //提交当前图层的更改
      submitChange: function () {
        var curLayerData = null;
        var self = this;
        let patchUrl = ''
        switch (this.curLayerType) {
          case 'YJG':
            patchUrl = baseUrl + "/layer/layers/point/id"
            break
          case 'LD':
            patchUrl = baseUrl + "/layer/layers/lamp/id"
            break
          case 'XSG':
            patchUrl = baseUrl + "/layer/layers/line/id"
            break
        }
        curLayerData = {type:self.curLayerType, pointList:[], lineList: []};
        this.curLayerMapDatas.forEach(function (curData) {
          if(self.curLayerType==="YJG" || self.curLayerType === 'LD'){
            curLayerData.pointList.push({
              x:curData.getPosition().lng(),
              y:curData.getPosition().lat(),
              z:curData.radius,
              url: curData.url,
              pointId: curData.pointId,
              repairIds: curData.repairIds,
              specialId: curData.specialId,
              status:curData.pointStatus
            });
            console.log(curLayerData.pointList)
          }
          else if(self.curLayerType==="XSG"){
            let vertices = curData.getPath();
            let xy1 = vertices.getAt(0);
            let xy2 = vertices.getAt(1);
            curLayerData.lineList.push({
              x: xy1.lng(),
              y: xy1.lat(),
              z: 0,
              x2: xy2.lng(),
              y2: xy2.lat(),
              z2: 0,
              status: curData.lineStatus
            });
          }
        });
        var postData = {
          layerId: this.curLayerId,
          data: curLayerData
        }
        console.log("postData", postData);

        this.$http.patch(patchUrl, postData)
          .then(function (response){
            let responseBody = response.body;
            if (responseBody.code === 200) {
              self.getLayerDatas(self.mapId);
              toastr.success("提交成功！");
            }
            else{
              toastr.error("提交失败！");
            }
          });
      },

      // 为点添加动态效果
      addPointClickListener: function (point) {
        google.maps.event.addListener(point,'click', () => {

          this.curPoint = point;
          console.log('point.pointStatus', point.pointStatus)
          this.curPointStatus = point.pointStatus || 'GOOD';
          this.lng = point.getPosition().lng();
          this.lat = point.getPosition().lat();
          this.radius = point.radius;

          let layerDatas = this.getLayerData(this.curLayerId)
          console.log('layerDatas', layerDatas.pointList[point.index])
          this.clickPoint = layerDatas.pointList[point.index]
          this.clickPoint.typeName = utils.getLayerNameFromType(this.curLayerType)
          if (this.curInfoWindow) {
            this.curInfoWindow.ownClose()
          }
          this.curInfoWindow = MapService.createInfoWindow(
            'point-info-div', 'point-info-parent', 'point-info-close-btn',
            MapService.getUperPos({lat: point.getPosition().lat(), lng: point.getPosition().lng()},
              this.map.getZoom()), this.map)
        });
      },
      getPointFromPointList () {

      },
      displayLine: function (line) {
        let vertices = line.getPath();
        this.lat = vertices.getAt(0).lat().toFixed(6);
        this.lng = vertices.getAt(0).lng().toFixed(6);
        this.lat2 = vertices.getAt(1).lat().toFixed(6);
        this.lng2 = vertices.getAt(1).lng().toFixed(6);
        this.dis = this.getTwoPointsDis(vertices.getAt(0),vertices.getAt(1));
      },
      addLineClickListener: function (line) {
        let self = this;
        google.maps.event.addListener(line,'click',function (event) {
          let originPoint={};
          originPoint.x = event.latLng.lng();
          originPoint.y = event.latLng.lat();

          $("#main-canvas").html("");
          startHeyuThree(originPoint,self.getLayerData(self.curLayerId).lineList);

          self.curLine = line;
          self.curPointStatus = line.lineStatus||"BREAK";
          self.displayLine(line);

          var infowindow = new google.maps.InfoWindow({
            content: document.getElementById("map-msg-line"),
            position: line.getPath().getAt(0)
          });
          infowindow.open(self.map);
          google.maps.event.addListener(infowindow, 'domready', function () {
            var closeBtn = $('.gm-style-iw').next();
            closeBtn.hide();
            $('#lineMapMsgBtn').on('click', function () {
              document.getElementById('map-msg-line-parent').append(document.getElementById('map-msg-line'));
              infowindow.close();
            });
          });
        });
        google.maps.event.addListener(line.getPath(), 'set_at', function () {
          self.displayLine(line);
        });
      },

      lngLatOnChange: function () {
        if(this.curLayerType==="YJG") {
          this.curPoint.center = new google.maps.LatLng(this.lat, this.lng);
          this.curPoint.setMap(null);
          this.curPoint.setMap(this.map);
        }
        else if(this.curLayerType==="XSG"){
          let vertices = this.curLine.getPath();
          vertices.removeAt(0);
          vertices.insertAt(0, new google.maps.LatLng(this.lat, this.lng))
          this.curLine.setMap(null);
          this.curLine.setMap(this.map);
        }
      },

      lngLat2OnChange: function(){
        let vertices = this.curLine.getPath();
        vertices.removeAt(1);
        vertices.insertAt(1, new google.maps.LatLng(this.lat2, this.lng2))
        this.curLine.setMap(null);
        this.curLine.setMap(this.map);
      },
      deletePointBtnClick: function () {
        this.curPoint.setMap(null);
        this.removeListByValue(this.curLayerMapDatas, this.curPoint);
        this.curPoint = null;
      },
      deleteLineBtnClick: function () {
        this.curLine.setMap(null);
        this.removeListByValue(this.curLayerMapDatas,this.curLine);
        this.curLine = null;
      },

      /* history */
      reverseCurHistory: function () {
        this.curHistory = this.curHistory ? 0 : 1;
        this.curLayerId = 0;
        if(this.curHistory) {
          this.setHistory();
        } else {
          this.getLayerDatas(this.mapId);
        }
      },
      async setHistory () {
        this.clearSelects()
        let respBody = await HistoryService.getById(this, this.mapId)
        if (respBody.code === 200) {
          this.histories = respBody.data
        } else {
          toastr.error('加载历史图层信息失败!')
        }
      },

      createHistory: function () {
        let desc = prompt('请输入历史版本描述信息', '');
        if(!desc)
          return;
        this.$http.post(baseUrl + '/history/histories', {
          mapId: this.mapId,
          description: desc
        }).then(function (response) {
          let responseBody = response.body
          if(responseBody.code===200)
            toastr.success('创建成功！');
          else
            toastr.error('创建失败！');
        }, function (result) {
          toastr.error('创建失败！');
        });
      },
      deleteHistory: function () {
        let self = this;
        this.$http.delete(baseUrl + '/history/histories/id?mapId='+this.mapId+'&historyId='+this.curHistory)
          .then(function (response) {
            let responseBody = response.body
            if(responseBody.code===200){
              self.setHistory();
              self.curHistory = 1;
              self.curLayerId = 0;
              self.selectLayers = [];
              toastr.success('删除成功！');
            }
            else
              toastr.error('删除失败！');
          }, function () {
            toastr.error('删除失败！');
          });
      },
      compareHistoryMap: function () {
        this.$router.push({name: 'mapCompare', params: {mapId: this.mapId}});
      },
      /* #history */

      /* utils */
      removeListByValue: function (arr, val) {
        for(let i=0; i<arr.length; i++) {
          if(arr[i] === val) {
            arr.splice(i, 1);
            break;
          }
        }
      },

      getLayerNameWithType: function (type) {
        return utils.getLayerNameFromType(type)
      },

      clearSelects () {
        this.curLayerId = 0
        this.selectLayers = []
      },

      onCurPointStatusChange (status) {
        this.curPoint.pointStatus = status;
        if(this.curLayerType === 'YJG') {
          MapService.changeWellColor(this.curPoint, MARKER_COLOR[status], this.map)
        } else {
          MapService.changeLampColor(this.curPoint, MARKER_COLOR[status], this.map)
        }
      },

      async getOwnRepairs () {
        let respBody = await RepairService.getAll(this)
        console.log('getOwnRepairs', respBody)
        console.log('layerDatas', this.layerDatas)
        if(respBody.code === 200) {
          respBody.data.forEach((repair) => {
            repair.originState = repair.state
          })
          this.ownRepairs = respBody.data
          this.ownRepairs = respBody.data.filter((repair) => {
            let flag = false
            for(let i = 0; i < this.layerDatas.layerList.length; i++) {
              if (repair.layerId === this.layerDatas.layerList[i].id) {
                flag = true
                break
              }
            }
            return flag
          })
        } else {
          toastr.error('加载用户报修失败！')
        }
      },

      onUpdateCenterClick (repairIndex) {
        console.log('onUpdateCenterClick', repairIndex, this.ownRepairs[repairIndex], this.curLayerMapDatas)
        MapService.updateCenter(this.map, {
          lng: this.ownRepairs[repairIndex].point.x,
          lat: this.ownRepairs[repairIndex].point.y
        })
        this.isShowingOwnRepairs = false
        this.curLayerMapDatas.forEach((point) => {
          if (point.specialId === this.ownRepairs[repairIndex].specialId) {
            if(this.curLayerType === 'YJG') {
              MapService.changeWellColor(point, MARKER_COLOR['HIGHLIGHT'], this.map)
            } else {
              MapService.changeLampColor(point, MARKER_COLOR['HIGHLIGHT'], this.map)
            }
          }
        })
      },
      /* #utils */

      /* google map utils */
      getTwoPointsDis: function (point1, point2 ) {
        return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
      },
      /* #google map utils */
    },
    watch: {
      curLayerId: function(newValue) {
        var self = this;
        this.clearMap(true);

        this.curPoint = null;
        this.curLine = null;

        if(parseInt(newValue)=== 0){
          this.curLayerType = 0;
          return;
        }

        var layerDatas = this.getLayerData(newValue);
        console.log('watch', layerDatas)
        this.curLayerType = layerDatas.type;

        console.log('curLayers', layerDatas)
        if(this.curLayerType==="YJG" || this.curLayerType === 'LD'){
          console.log(layerDatas.pointList)
          layerDatas.pointList.forEach((layerData, index) => {
            self.createPointDetail({lng:layerData.x,lat:layerData.y}, layerData.status, layerData.z,
              layerData.specialId, layerData.url, layerData.pointId, layerData.repairIds, index);
          });
        }
        else if(this.curLayerType==="XSG"){
          layerDatas.lineList.forEach(function (layerData) {
            let curLine = self.createLine(self.map,[
              {lng:layerData.x, lat:layerData.y},
              {lng:layerData.x2, lat:layerData.y2}
            ],self.getColorWithStatus(layerData.status));
            curLine.lineStatus = layerData.status;
            self.curLayerMapDatas.push(curLine);
          });
        }

      },
      curPointStatus: function (newValue, oldValue) {
        if (!oldValue) {
          return
        }
        if(this.curLayerType==="YJG"){
//          this.curPoint.pointStatus = newValue;
//          MapService.changeWellColor(this.curPoint, MARKER_COLOR[newValue], this.map)
        }
        else if(this.curLayerType === "XSG"){
          this.curLine.lineStatus = newValue;
          this.curLine.strokeColor = this.getColorWithStatus(newValue);
          MapService.refreshComponent(this.curLine, this.map)
        }
      },
      async curHistory (newValue) {
        this.clearSelects()
        if(newValue !== 1 && newValue !== '1') {
          let respBody = await HistoryService.getLayersByHistory(this, newValue)
          if (respBody.code === 200) {
            this.layerDatas= respBody.data
            this.setLayerSelect(this.layerDatas.data, true)
          }
        }
      },

    },
    mounted(){
      this.initMap();
      this.getLayerDatas(this.mapId);
      this.getOwnRepairs()
      toastr.options = {
        closeButton: true,
        progressBar: true,
        showMethod: 'slideDown',
        timeOut: 4000
      };
    }
  }
</script>

<style>
  @import "../../node_modules/vodal/common.css";
  @import "../../node_modules/vodal/rotate.css";
  .navbar{
    margin-bottom: 0;
  }

  .btn-half-left, .btn-half-right{
    width: 45%!important;
  }
  .btn-half-left{
    margin-right: 6%!important;
  }

  .right-float{
    float: right;
    margin-left: 10px;
  }

  .gis-icon{
    color: black;
  }
  .gis-icon-white{
    color: whitesmoke;
  }
  .gis-icon:hover{
    color: #1ab394;
  }
  div#withThree {
    position:relative;
  }
  div#main-canvas {
    position: absolute;
    top: 0px;
    left: 0;
    z-index: 1;
    display: none;
    margin-right: -15px;
    margin-left: -15px;
    width: 600px;
    height: 600px;
    border-right: 3px solid dimgrey;
    /*background: transparent;*/
    background-color: rgba(238, 238, 238, 0.6);
  }
  .icon {
    width: 20px;
  }
</style>
