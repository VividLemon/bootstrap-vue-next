<template>
  <!-- #region template -->
  <BTableSimple hover small caption-top stacked="md">
    <caption>
      Items sold in August, by City:
    </caption>
    <BThead>
      <BTr>
        <BTh>City</BTh>
        <BTh>Country</BTh>
        <BTh>Clothes: Trousers</BTh>
        <BTh>Clothes: Skirts</BTh>
        <BTh>Clothes: Dresses</BTh>
        <BTh>Accessories: Bracelets</BTh>
        <BTh>Accessories: Rings</BTh>
      </BTr>
    </BThead>
    <BTbody>
      <BTr>
        <BTd data-cell="City">Antwerp</BTd>
        <BTd data-cell="Country">Belgium</BTd>
        <BTd data-cell="Clothes: Trousers">56</BTd>
        <BTd data-cell="Clothes: Skirts">22</BTd>
        <BTd data-cell="Clothes: Dresses">43</BTd>
        <BTd data-cell="Accessories: Bracelets" theme="success">72</BTd>
        <BTd data-cell="Accessories: Rings">23</BTd>
      </BTr>
      <BTr>
        <BTd data-cell="City">Gent</BTd>
        <BTd data-cell="Country">Belgium</BTd>
        <BTd data-cell="Clothes: Trousers">46</BTd>
        <BTd data-cell="Clothes: Skirts" theme="warning">18</BTd>
        <BTd data-cell="Clothes: Dresses">50</BTd>
        <BTd data-cell="Accessories: Bracelets">61</BTd>
        <BTd data-cell="Accessories: Rings" theme="danger">15</BTd>
      </BTr>
      <BTr>
        <BTd data-cell="City">Amsterdam</BTd>
        <BTd data-cell="Country">The Netherlands</BTd>
        <BTd data-cell="Clothes: Trousers" theme="success">89</BTd>
        <BTd data-cell="Clothes: Skirts">34</BTd>
        <BTd data-cell="Clothes: Dresses">69</BTd>
        <BTd data-cell="Accessories: Bracelets">85</BTd>
        <BTd data-cell="Accessories: Rings">38</BTd>
      </BTr>
      <BTr>
        <BTd data-cell="City">Utrecht</BTd>
        <BTd data-cell="Country">The Netherlands</BTd>
        <BTd data-cell="Clothes: Trousers">80</BTd>
        <BTd data-cell="Clothes: Skirts" theme="danger">12</BTd>
        <BTd data-cell="Clothes: Dresses">43</BTd>
        <BTd data-cell="Accessories: Bracelets">36</BTd>
        <BTd data-cell="Accessories: Rings" theme="warning">19</BTd>
      </BTr>
    </BTbody>
  </BTableSimple>
  <!-- #endregion template -->
</template>
