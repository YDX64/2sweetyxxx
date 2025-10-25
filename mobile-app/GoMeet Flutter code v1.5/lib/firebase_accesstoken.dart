// import 'package:googleapis_auth/auth_io.dart';
// import 'package:dating/core/config.dart';
//
// class FirebaseAccesstoken {
//   static String firebaseMessageScope = "https://www.googleapis.com/auth/firebase.messaging";
//
//   Future<String> getAccessToken() async {
//     final credentials = ServiceAccountCredentials.fromJson({
//       "type": "service_account",
//       "project_id": "redbus-3ec46",
//       "private_key_id": "e77d320455de41fee98018714026d3e50ab664d0",
//       "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCo9DgaUW+ENByi\nUO7hhFN5CEfm4fCEdgfi+fhR4LaleFeqToEt64L5NqjpyM8E0LztRF2iR4E31vLq\nWv0xxrbEdyxZ4ovlNGu9V3poAjOVYO0Z8Dp5zwmxClAYMYM9RNjLoD2VPgG4YR2/\nSv+XH2Qpv8WcdfIMLEzOLx71nMMKvrcbvBB7UrVeYbZwdreketugfmqQzznwL366\nGyZMPfwcXRIf+k0TYUrR5ukJ/rOiOqK8fu2P0WXh2Y3EoPE5C2E39o6q9hOYBO4B\nwYLzPJzeyYvLFmhSZ9mX+QGebm0LUpfo8zQovanAK1aXV7vSycun7CVuqrSAzHCv\n7Ob70lJBAgMBAAECggEAR7GqhPB9o9oBNJenZqciTL/I0x6ZU3xKiHSOfSAgIUNZ\n3/kENBo2L86UCvCdeGujYAOcwBobqThbSDtoKdErCV+QwGuz9YUzGtueI7ibbw38\nTv9zsPC8KhY4Oqv4Bu3KGU5cE5KGZFlBqEUJBHXbqSOplWUvWx8JUI0KVCs7ULlA\nJlzrfCgK/K4wFAjwJFcknFtrvIxnIqumva1QAt8Y4Ic4ZSzHX+vd36qcEPXqbEif\nrJizuRc8qnyCWq6Sx8qDIrXdxdSbKHkheHhtYTm8jSHfNtKITccpCqZQihbcmxJv\nFPQLCG4cadLZblcE1UY4+8dE1txEZjSuhTq2aEe0KQKBgQDhLiYGDX90MJlzOAGz\ne6Fbn+KXi5xP8TPBIOe57crLKLVXqmTsGY/KEek92Wyl9oNNfXNFwAYEDxweU4WE\n7wFggMTG2peZVx2/vnKSUIt+n9yO30Z4DWezZt2IhzBPBtJZKuTml1o9MSftub8R\nrl9U7C/V37zn9yS/B+FcBDDBYwKBgQDAFASGP8QhAj+qwovFKjyrXTIN5dgiUp2c\nx0g/pdYTvM8ZqDhrHRmjQXymPcCxd+rYqyrzXvJgy3T7UJ9I9LGfiHDLs42LYkdl\nL3/bwtOadFTD/TG5u/5WX815ffrDxOtgDYrsvfM0E0zy16n6bal/3XFyiY+sE00u\nOUHD+dbhCwKBgC7nYO4z04+NK/lu+hO7tcGTDSzJ3NZeBIy+4OW+nVYx9Yv8Jydy\nr5vEnVPPvSzYq0Lx1Zf6xoYD67R5az9kVWIXkGVnVNqQ5dZxwgWuF1BZ1iRAZ7pL\n+ITK8Wwl1K8xWZFPOPy7HAXQ/mMrJJx3OM5EoDYpc3zR4uqTpqJ3EPzHAoGACgbB\nebSIa2SvqB1BqIgc5KEXxMvzrU78tTtd1Ry2AQ/BC8jRMR4ywWfgttjQXzMwSiEd\nO9j/8/eK4reBqRBE2VwI70kvIVB/A5QoK3OPEifyaMyltNlQXHfhxO7DkUaNNtVe\nJB+CO3yqbp69W7ovt+H6Uw1FN6lGRRxuB2naQqMCgYEAmJ/hpGER0SKJf/v34/TP\nBDIRDwLJINAlA30BSx/AgAjzVdYZh45S1iM+49nwvobNvXlIxfrq9/5ZN7UPUups\nB95s9hvldD9BLA6OXOJqk+uIhkAwBKOIVB8PAD2URbMKlTV8600PachBqniU56Ux\n5XYwyTKdyl+KuD5M46mXCJo=\n-----END PRIVATE KEY-----\n",
//       "client_email": "firebase-adminsdk-1fgos@redbus-3ec46.iam.gserviceaccount.com",
//       "client_id": "104380614981963443179",
//       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//       "token_uri": "https://oauth2.googleapis.com/token",
//       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//       "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1fgos%40redbus-3ec46.iam.gserviceaccount.com",
//       "universe_domain": "googleapis.com"
//     });
//
//     final client = await clientViaServiceAccount(credentials, [firebaseMessageScope]);
//
//     final accessToken = client.credentials.accessToken.data;
//     Config.firebaseKey = accessToken;
//     print("+++++++++++++++++:---- ${Config.firebaseKey}");
//     return accessToken;
//   }
//
// }





import 'package:googleapis_auth/auth_io.dart';
import 'package:dating/core/config.dart';

class FirebaseAccesstoken {
  static String firebaseMessageScope = "https://www.googleapis.com/auth/firebase.messaging";

  Future<String> getAccessToken() async {
    final credentials = ServiceAccountCredentials.fromJson({
      "type": "service_account",
      "project_id": "redbus-3ec46",
      "private_key_id": "5e2cd3047cc4639fcfab379fe97f99fa15b8769b",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCGT8M4aFqvB3BR\nY65FBP2n+J+wH2F5/0UET5OGYQt3/sIMAu+D6Dt8/myIEXJdjNMZPTUQ9wkCdulO\natYHXOHqjeVV2qGoGORUHc+p2uDRRsxTv2ZqrPcQoqdPtOZuq8kddn5uhWZRNfZg\nN1SSJFTyPIkmUyciD6ZW93TGzpXLKpM8R9yESJGXe3pom+3+NlgDhl3jyqH+MsKe\nMPjITmQRUiBFY0Q9j9iMb4+DXFQkk08hULpnSLWnbs+ah3EFlWToZ+txlO20D2sy\nklvh0ZaY+uF9Hgta2Al07reYNhNRx6j4q0Ci0ocG7J4bqIAyUDc6KJevQz84GLC1\n7/bzblKFAgMBAAECggEABaYwM1ysR8Vb04iKSWvi0WBTMyC2xF9Yw0wni9TkGxlz\nhvbOpTEs415+KSD2uvmT3XFmHH8PeXOP75TtyKR++hMazMgj2YKmg+U3GVFT+Glu\naa1YvO7me2Qj/mXA9XGzRVJ5EeP5gDvxT220WGs/yWqDaEHCGRwoZmsFFeGVilSC\nAEtbvgZCo2nIYI24oUL+SSWYPwiS0Kma6RTtVpTa/xgrU1PyWJsqhvytPyZhnZ9Y\n8j0Osks0G9jql6h1vyz+lJ1hR8nzuN7uR4TUC/bo9GOai6oQEfsRAxo0Vw1nNl7d\nfN16/rrQj9LrMDn+3kuTqVObemQazyCKtbKDHgpj5wKBgQC710J+frzbvnwYNs7K\nX6ixbYVl9yTddlWDdR5iWmMODsJuwvgBwSbHh8JA7LT6Bh3zUjG/q82SKYxOWTe6\nV6qYd9UEhor2QSH00lTH9ke7Ts4wOjf5xYIv8n191FjGXfvA+1+p40QkpBkfoP1Z\n35qmLFcAXx17PPUTLs3qFL0KkwKBgQC3DBwSKBf6OzdnjMJ9Ani0LbhmPmQfJrpp\nxWPnaZUwxfKEGHlQRcEkgc1fUknaMDNGNV9AocPRzn6setchASdreMvvTqsY8g3o\nMct6raTL/BB3MRqQ0CgcdEJgm6Do26SKuaQzfuORFmURntMrIBl0LhEKVZ6Gtfa6\nKA77f3+lhwKBgQC3iS3UcTtRLr8L3cmSHYOz0YJtTd18clo9txr4GL7+hldeaCxx\ncmvUvAaG74IpZf6vt9kaIeEb9nK8PxpffbcXgMbnxBpVYPCvyS/DrhUKpIZ8wvXc\nnCqHdNU/NFOFh2Esf7FKSuBTOO+/YssJnJz7zwk3OLiSqM4Bb1MNbDQF9wKBgGhD\nm5G0CMReCpcPFJFEYSCwkkKa80jTNIefCeL8vyBDAHrBvgg9U2DKFwNeyfZgUjSB\nnjoganwNlRYF+pgwIhYTfoZXVxokdkt2YaMFWcNfVrmt3KX0C4T5q/1/aE57HeRv\nDdrPQiyYhwVcZIhCBn2o58ftMRkmeN1ch/w1ia3tAoGARhWf4ErrlofaG1hZkgtk\nzHbe/5TLc7eOsTpjbovA4I41ibHqczTlAkQ1egOaKye1m6moSHcHzwJEkVp1BcdP\nAc66b0PFjGq6DSr3zkS3ktmobqGMRyU9GczZr+CDjAQ5DXSUcupIcjr5i5l4Sq2y\nY+tJUohF4QSCtijtD90CNuc=\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-1fgos@redbus-3ec46.iam.gserviceaccount.com",
      "client_id": "104380614981963443179",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1fgos%40redbus-3ec46.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    });
    print("+++++++++++++++++1:---- ${credentials.toString()}");
    try{
      final client = await clientViaServiceAccount(credentials, [firebaseMessageScope]);
      print("+++++++++++++++++2:---- ${client.credentials.accessToken.data}");

      final accessToken = client.credentials.accessToken.data;
      Config.firebaseKey = accessToken;
      print("+++++++++++++++++3:---- ${Config.firebaseKey}");
      return accessToken;

    }catch(e){
      print("Error --${e.toString()}");
      return "";
    }

  }
}