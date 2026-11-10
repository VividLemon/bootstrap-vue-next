<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <BTableSimple>
          <BTbody>
            <BTr>
              <BTd>{{ count }}</BTd>
              <BTd data-cell="sm">{{ count }}</BTd>
              <BTd><button @click="count++">Increment</button></BTd>
            </BTr>
          </BTbody>
        </BTableSimple>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <button @click="count++">Increment</button>
        {{ count }}
      </BCol>
    </BRow>

    <BRow>
      <BCol>
        <BTableSimple responsive>
          <BThead>
            <BTr>
              <BTh sticky-column>Sticky Column Header</BTh>
              <BTh>Heading 1</BTh>
              <BTh>Heading 2</BTh>
              <BTh>Heading 3</BTh>
              <BTh>Heading 4</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr>
              <BTd sticky-column :color="{ theme: 'primary' }">Sticky Column Row Header</BTd>
              <BTd>Cell</BTd>
              <BTd>Cell</BTd>
              <BTd>Cell</BTd>
              <BTd>Cell</BTd>
            </BTr>
            <BTr>
              <BTh sticky-column>Sticky Column Row Header</BTh>
              <BTd>Cell</BTd>
              <BTd>Cell</BTd>
              <BTd>Cell</BTd>
              <BTd>Cell</BTd>
            </BTr>
          </BTbody>
          <BTfoot>
            <BTr>
              <BTh sticky-column>Sticky Column Footer</BTh>
              <BTh>Heading 1</BTh>
              <BTh>Heading 2</BTh>
              <BTh>Heading 3</BTh>
              <BTh>Heading 4</BTh>
            </BTr>
          </BTfoot>
        </BTableSimple>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BTableSimple hover small caption-top responsive>
          <caption>
            Items sold in August, grouped by Country and City:
          </caption>
          <colgroup>
            <col />
            <col />
          </colgroup>
          <colgroup>
            <col />
            <col />
            <col />
          </colgroup>
          <colgroup>
            <col />
            <col />
          </colgroup>
          <BThead :color="{ theme: 'inverse' }">
            <BTr>
              <BTh colspan="2">Region</BTh>
              <BTh colspan="3">Clothes</BTh>
              <BTh colspan="2">Accessories</BTh>
            </BTr>
            <BTr>
              <BTh>Country</BTh>
              <BTh>City</BTh>
              <BTh>Trousers</BTh>
              <BTh>Skirts</BTh>
              <BTh>Dresses</BTh>
              <BTh>Bracelets</BTh>
              <BTh>Rings</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr>
              <BTh rowspan="3">Belgium</BTh>
              <BTh class="text-end">Antwerp</BTh>
              <BTd>56</BTd>
              <BTd>22</BTd>
              <BTd>43</BTd>
              <BTd :color="{ theme: 'success' }">72</BTd>
              <BTd>23</BTd>
            </BTr>
            <BTr>
              <BTh class="text-end">Gent</BTh>
              <BTd>46</BTd>
              <BTd :color="{ theme: 'warning' }">18</BTd>
              <BTd>50</BTd>
              <BTd>61</BTd>
              <BTd :color="{ theme: 'danger' }">15</BTd>
            </BTr>
            <BTr>
              <BTh class="text-end">Brussels</BTh>
              <BTd>51</BTd>
              <BTd>27</BTd>
              <BTd>38</BTd>
              <BTd>69</BTd>
              <BTd>28</BTd>
            </BTr>
            <BTr>
              <BTh rowspan="2">The Netherlands</BTh>
              <BTh class="text-end">Amsterdam</BTh>
              <BTd :color="{ theme: 'success' }">89</BTd>
              <BTd>34</BTd>
              <BTd>69</BTd>
              <BTd>85</BTd>
              <BTd>38</BTd>
            </BTr>
            <BTr>
              <BTh class="text-end">Utrecht</BTh>
              <BTd>80</BTd>
              <BTd :color="{ theme: 'danger' }">12</BTd>
              <BTd>43</BTd>
              <BTd>36</BTd>
              <BTd :color="{ theme: 'warning' }">19</BTd>
            </BTr>
          </BTbody>
          <BTfoot>
            <BTr>
              <BTd colspan="7" :color="{ theme: 'secondary' }" class="text-end">
                Total Rows:
                <b>5</b>
              </BTd>
            </BTr>
          </BTfoot>
        </BTableSimple>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BTableSimple hover small caption-top stacked>
          <caption>
            Items sold in August, grouped by Country and City:
          </caption>
          <colgroup>
            <col />
            <col />
          </colgroup>
          <colgroup>
            <col />
            <col />
            <col />
          </colgroup>
          <colgroup>
            <col />
            <col />
          </colgroup>
          <BThead :color="{ theme: 'inverse' }">
            <BTr>
              <BTh colspan="2">Region</BTh>
              <BTh colspan="3">Clothes</BTh>
              <BTh colspan="2">Accessories</BTh>
            </BTr>
            <BTr>
              <BTh>Country</BTh>
              <BTh>City</BTh>
              <BTh>Trousers</BTh>
              <BTh>Skirts</BTh>
              <BTh>Dresses</BTh>
              <BTh>Bracelets</BTh>
              <BTh>Rings</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr>
              <BTh rowspan="3" class="text-center">Belgium (3 Cities)</BTh>
              <BTd data-cell="City" class="text-start">Antwerp</BTd>
              <BTd data-cell="Clothes: Trousers">56</BTd>
              <BTd data-cell="Clothes: Skirts">22</BTd>
              <BTd data-cell="Clothes: Dresses">43</BTd>
              <BTd data-cell="Accessories: Bracelets" :color="{ theme: 'success' }">72</BTd>
              <BTd data-cell="Accessories: Rings">23</BTd>
            </BTr>
            <BTr>
              <BTd data-cell="City">Gent</BTd>
              <BTd data-cell="Clothes: Trousers">46</BTd>
              <BTd data-cell="Clothes: Skirts" :color="{ theme: 'warning' }">18</BTd>
              <BTd data-cell="Clothes: Dresses">50</BTd>
              <BTd data-cell="Accessories: Bracelets">61</BTd>
              <BTd data-cell="Accessories: Rings" :color="{ theme: 'danger' }">15</BTd>
            </BTr>
            <BTr>
              <BTd data-cell="City">Brussels</BTd>
              <BTd data-cell="Clothes: Trousers">51</BTd>
              <BTd data-cell="Clothes: Skirts">27</BTd>
              <BTd data-cell="Clothes: Dresses">38</BTd>
              <BTd data-cell="Accessories: Bracelets">69</BTd>
              <BTd data-cell="Accessories: Rings">28</BTd>
            </BTr>
            <BTr>
              <BTh rowspan="2" class="text-center">The Netherlands (2 Cities)</BTh>
              <BTd data-cell="City">Amsterdam</BTd>
              <BTd data-cell="Clothes: Trousers" :color="{ theme: 'success' }">89</BTd>
              <BTd data-cell="Clothes: Skirts">34</BTd>
              <BTd data-cell="Clothes: Dresses">69</BTd>
              <BTd data-cell="Accessories: Bracelets">85</BTd>
              <BTd data-cell="Accessories: Rings">38</BTd>
            </BTr>
            <BTr>
              <BTd data-cell="City">Utrecht</BTd>
              <BTd data-cell="Clothes: Trousers">80</BTd>
              <BTd data-cell="Clothes: Skirts" :color="{ theme: 'danger' }">12</BTd>
              <BTd data-cell="Clothes: Dresses">43</BTd>
              <BTd data-cell="Accessories: Bracelets">36</BTd>
              <BTd data-cell="Accessories: Rings" :color="{ theme: 'warning' }">19</BTd>
            </BTr>
          </BTbody>
          <BTfoot>
            <BTr>
              <BTd colspan="7" :color="{ theme: 'secondary' }" class="text-end">
                Total Rows:
                <b>5</b>
              </BTd>
            </BTr>
          </BTfoot>
        </BTableSimple>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const count = ref(0)
</script>
