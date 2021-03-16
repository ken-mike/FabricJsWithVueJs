<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="6" md="6">
      <v-card>
        <v-card-title class="headline">
          エディタ
        </v-card-title>
        <v-card-text>
          <p>こちらの編集内容はページ1枚に相当します。</p>
          <v-row justify="center">
            <canvas ref="palette" id="palette" width="550" height="600"></canvas>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-col>
            <v-btn color="primary" @click="addText"> テキストを追加 </v-btn>
            <v-btn color="primary" @click="savePaletteDate"> セーブ </v-btn>
            <v-btn color="primary" @click="loadPaletteDate"> ロード </v-btn>
            <v-btn color="primary" @click="redo"> Redo </v-btn>
            <v-btn color="primary" @click="undo"> Undo </v-btn>
            <v-btn color="primary" @click="remove"> 選択中のオブジェクトを削除 </v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
      セーブ済みの情報
      {{ savedPaletteDate }}
      <p>※これをDBに収納すればセーブ・ロードができる&VueDraggableと組み合わせればページの入れ替えも可能</p>
    </v-col>
  </v-row>
</template>

<script lang="ts">
  import { Component, Vue } from 'nuxt-property-decorator'
  import { fabricCanvas } from '@/interfaces'

  @Component
  export default class Index extends Vue {
    savedPaletteDate = {}

    get palette(): fabricCanvas {
      return (this.$refs as any).palette;
    }

    redo() {
      this.palette.fabric.redo()
    }

    undo() {
      this.palette.fabric.undo()
    }

    remove() {
      const activeObjects = this.palette.fabric.getActiveObjects();
      activeObjects.forEach((element: HTMLElement) => {
        this.palette.fabric.remove(element);
      });
    }

    mounted() {
      this.palette.fabric = new fabric.Canvas("palette");
    }

    addText() {
      const text = new fabric.Textbox("テキスト", {
        top: 0,
        left: 0,
        fontSize: 24,
      });

      this.palette.fabric.add(text)
    }

    savePaletteDate() {
      const paletteDate = this.palette.fabric.toObject()
      this.savedPaletteDate = paletteDate
    }

    loadPaletteDate() {
      this.palette.fabric.loadFromJSON(this.savedPaletteDate, () => {
        this.palette.fabric.renderAll()
      })
    }

    getPaletteDate() {
      this.paletteDate = this.palette.fabric.toObject()
    }
  }
</script>

<style lang="scss" scoped>
  #palette {
    border: 1px solid;
  }
</style>
